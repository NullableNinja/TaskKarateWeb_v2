import { writable, derived } from "svelte/store";

// ----------------------------------------
// STORES
// ----------------------------------------
export const students = writable([]);
export const activeStudent = writable(null);
export const news = writable([]);

const SESSION_KEY = "tkStudentSession";

// ----------------------------------------
// SAFE BROWSER-ONLY SESSION RESTORE
// (SvelteKit cannot touch localStorage on SSR)
// ----------------------------------------
if (typeof window !== "undefined") {
  const saved = localStorage.getItem(SESSION_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.id) {
        activeStudent.set(parsed);
      }
    } catch (err) {
      console.warn("Invalid session data:", err);
    }
  }
}

// ----------------------------------------
// LOAD STUDENTS (STATIC FILE UNDER /static/data/)
// ----------------------------------------
export async function loadStudents() {
  // First, try dynamic import from canonical app source (src/data)
  // Only attempt on client; SvelteKit SSR cannot import JSON this way.
  let data = null;
  if (typeof window !== 'undefined') {
    try {
      console.debug('students: attempting dynamic import from src/data/students.json');
      const mod = await import('../../data/students.json');
      data = (mod && (mod.default || mod)) || null;
      if (data) {
        console.debug('students: loaded data via dynamic import (src/data/students.json)');
      }
    } catch (err) {
      console.debug('students: dynamic import failed:', err && err.message ? err.message : err);
    }
  } else {
    console.debug('students: skipping dynamic import during SSR');
  }

  // If dynamic import didn't produce data, fall back to static paths
  if (!data) {
    const candidatePaths = [
      '/data/students.json',
      '/assets/data/students.json',
      '/student-dashboard/static/data/students.json',
      './assets/data/students.json'
    ];

    for (const p of candidatePaths) {
      try {
        console.debug(`students: trying ${p}`);
        const res = await fetch(p);
        if (!res.ok) {
          console.debug(`students: ${p} returned ${res.status}`);
          continue;
        }
        data = await res.json();
        console.debug(`students: loaded data from ${p}`);
        // stop at first successful load
        break;
      } catch (err) {
        console.debug(`students: fetch ${p} failed:`, err && err.message ? err.message : err);
      }
    }
  }

  if (!data) {
    console.error('Failed to load students.json from any known path.');
    students.set([]);
    news.set([]);
    return;
  }

  const studentsData = data.students || [];
  syncMutualBuddies(studentsData);
  students.set(studentsData);
  news.set(data.news || []);
}

// ----------------------------------------
// SYNC MUTUAL BUDDIES
// ----------------------------------------
export function syncMutualBuddies(studentsArray) {
  const byName = {};
  const byId = {};
  
  studentsArray.forEach(s => {
    byName[s.name] = s;
    if (s.displayName) byName[s.displayName] = s;
    byId[s.id] = s;
  });

  studentsArray.forEach(student => {
    if (!student.buddies) student.buddies = [];
    
    student.buddies.forEach(buddy => {
      const buddyStudent = byName[buddy.name];
      if (buddyStudent) {
        if (!buddyStudent.buddies) buddyStudent.buddies = [];
        const alreadyBuddy = buddyStudent.buddies.some(b => 
          b.name === student.name || b.name === student.displayName
        );
        if (!alreadyBuddy) {
          buddyStudent.buddies.push({
            name: student.displayName || student.name,
            rank: student.rank,
            streak: 0,
            status: "Buddy"
          });
        }
      }
    });
  });
}

// ----------------------------------------
// SEND MESSAGE (updates both sender and recipient)
// ----------------------------------------
export function sendMessage(fromId, toId, text, studentsArray) {
  const sender = studentsArray.find(s => s.id === fromId);
  const recipient = studentsArray.find(s => s.id === toId);
  
  if (!sender || !recipient) {
    console.error('Cannot send message: sender or recipient not found');
    return null;
  }
  
  const msg = {
    fromId,
    toId,
    text,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  if (!sender.messages) sender.messages = [];
  if (!recipient.messages) recipient.messages = [];
  
  sender.messages.push(msg);
  recipient.messages.push(msg);
  
  // Make them mutual buddies if not already
  if (!sender.buddies) sender.buddies = [];
  if (!recipient.buddies) recipient.buddies = [];
  
  const senderHasRecipient = sender.buddies.some(b => 
    b.name === recipient.name || b.name === recipient.displayName
  );
  const recipientHasSender = recipient.buddies.some(b => 
    b.name === sender.name || b.name === sender.displayName
  );
  
  if (!senderHasRecipient) {
    sender.buddies.push({
      name: recipient.displayName || recipient.name,
      rank: recipient.rank,
      streak: 0,
      status: "Buddy"
    });
  }
  
  if (!recipientHasSender) {
    recipient.buddies.push({
      name: sender.displayName || sender.name,
      rank: sender.rank,
      streak: 0,
      status: "Buddy"
    });
  }
  
  return msg;
}

// ----------------------------------------
// FRIENDS: requests and relationships
// ----------------------------------------
function ensureSocialFields(s) {
  if (!s.friends) s.friends = [];
  if (!s.friendRequestsIncoming) s.friendRequestsIncoming = [];
  if (!s.friendRequestsOutgoing) s.friendRequestsOutgoing = [];
}

export function sendFriendRequest(fromId, toId) {
  students.update(arr => {
    const from = arr.find(s => s.id === fromId);
    const to = arr.find(s => s.id === toId);
    if (!from || !to) return arr;
    ensureSocialFields(from); ensureSocialFields(to);
    if (from.friends.includes(toId)) return arr; // already friends
    if (from.friendRequestsOutgoing.includes(toId)) return arr; // already requested
    if (to.friendRequestsIncoming.includes(fromId)) return arr; // pending already
    from.friendRequestsOutgoing.push(toId);
    to.friendRequestsIncoming.push(fromId);
    return arr;
  });
}

export function acceptFriendRequest(toId, fromId, forceAdd = false) {
  students.update(arr => {
    const to = arr.find(s => s.id === toId);
    const from = arr.find(s => s.id === fromId);
    if (!from || !to) return arr;
    ensureSocialFields(from); ensureSocialFields(to);
    // Remove pending request entries (if they exist)
    to.friendRequestsIncoming = to.friendRequestsIncoming.filter(id => id !== fromId);
    from.friendRequestsOutgoing = from.friendRequestsOutgoing.filter(id => id !== toId);
    // Add friendship if not present (forceAdd bypasses request requirement)
    if (!to.friends.includes(fromId)) to.friends.push(fromId);
    if (!from.friends.includes(toId)) from.friends.push(toId);
    return arr;
  });
}

export function rejectFriendRequest(toId, fromId) {
  students.update(arr => {
    const to = arr.find(s => s.id === toId);
    const from = arr.find(s => s.id === fromId);
    if (!from || !to) return arr;
    ensureSocialFields(from); ensureSocialFields(to);
    to.friendRequestsIncoming = to.friendRequestsIncoming.filter(id => id !== fromId);
    from.friendRequestsOutgoing = from.friendRequestsOutgoing.filter(id => id !== toId);
    return arr;
  });
}

export function removeFriend(aId, bId) {
  students.update(arr => {
    const a = arr.find(s => s.id === aId);
    const b = arr.find(s => s.id === bId);
    if (!a || !b) return arr;
    ensureSocialFields(a); ensureSocialFields(b);
    a.friends = a.friends.filter(id => id !== bId);
    b.friends = b.friends.filter(id => id !== aId);
    return arr;
  });
}

// ----------------------------------------
// FEED INTERACTIONS: fist bumps and comments
// ----------------------------------------
export function addFeedInteraction(targetStudentId, actorId, type, text = null) {
  students.update(arr => {
    const target = arr.find(s => s.id === targetStudentId);
    if (!target) return arr;
    if (!target.feedInteractions) target.feedInteractions = [];
    const interaction = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 9),
      actorId,
      type, // 'fistBump' or 'comment'
      text,
      timestamp: new Date().toISOString()
    };
    target.feedInteractions.push(interaction);
    return arr;
  });
}

// ----------------------------------------
// HELPER: Find student by ID
// ----------------------------------------
export function getStudentById(studentsArray, id) {
  return studentsArray.find(s => s.id === id);
}

// ----------------------------------------
// SET ACTIVE STUDENT
// ----------------------------------------
export function setActiveStudent(studentObj) {
  activeStudent.set(studentObj);

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(studentObj));
  }
}

// ----------------------------------------
// Derived KPIs for the active student
// ----------------------------------------
export const activeStudentKpis = derived(activeStudent, ($activeStudent) => {
  if (!$activeStudent) return {
    unreadMessages: 0,
    badgesCount: 0,
    badgesByLevel: {},
    assignmentsDue: 0,
    practiceCount: 0,
    daysSinceLastClass: null,
    attendanceDates: []
  };

  const msgs = Array.isArray($activeStudent.messages) ? $activeStudent.messages : [];
  const unreadMessages = msgs.filter(m => m.toId === $activeStudent.id && !m.read).length;

  const badges = Array.isArray($activeStudent.badges) ? $activeStudent.badges : [];
  const badgesCount = badges.length;
  const badgesByLevel = badges.reduce((acc, b) => { const l = b.level || 'Unknown'; acc[l] = (acc[l] || 0) + 1; return acc; }, {});

  const assignmentsDue = Array.isArray($activeStudent.assignments) ? $activeStudent.assignments.filter(a => a.due).length : 0;
  const practiceCount = Array.isArray($activeStudent.practice) ? $activeStudent.practice.length : 0;

  let daysSinceLastClass = null;
  if ($activeStudent.lastClassDate) {
    const last = new Date($activeStudent.lastClassDate);
    if (!isNaN(last.getTime())) {
      daysSinceLastClass = Math.floor((Date.now() - last.getTime()) / 86400000);
    }
  }

  const attendanceDates = Array.isArray($activeStudent.attendanceDates) ? $activeStudent.attendanceDates.slice() : [];

  return { unreadMessages, badgesCount, badgesByLevel, assignmentsDue, practiceCount, daysSinceLastClass, attendanceDates };
});
