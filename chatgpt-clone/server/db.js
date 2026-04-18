import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB (creates file if it doesn't exist)
const db = new Database(path.join(__dirname, 'database.sqlite'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS   conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    convId TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(convId) REFERENCES conversations(id) ON DELETE CASCADE
  );
`);

/**
 * Get all conversations, sorted by newest first
 */
export function getConversations() {
  const stmt = db.prepare('SELECT * FROM conversations ORDER BY createdAt DESC');
  return stmt.all();
}

/**
 * Get all messages for a given conversation
 */
export function getMessages(convId) {
  const stmt = db.prepare('SELECT * FROM messages WHERE convId = ? ORDER BY id ASC');
  return stmt.all(convId);
}

/**
 * Create a new conversation (or update title if it exists)
 */
export function createConversation(id, title) {
  const stmt = db.prepare(`
    INSERT INTO conversations (id, title) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET title = excluded.title
  `);
  stmt.run(id, title);
  return { id, title };
}

/**
 * Delete a conversation (cascades to messages due to DB foreign key, though SQLite needs PRAGMA foreign_keys = ON)
 */
export function deleteConversation(id) {
  // Ensure foreign keys are enforced for cascading delete
  db.pragma('foreign_keys = ON');
  const stmt = db.prepare('DELETE FROM conversations WHERE id = ?');
  stmt.run(id);
}

/**
 * Add a message to a conversation
 */
export function addMessage(convId, role, content) {
  const stmt = db.prepare('INSERT INTO messages (convId, role, content) VALUES (?, ?, ?)');
  const info = stmt.run(convId, role, content);
  return info.lastInsertRowid;
}

/**
 * Check if a conversation exists
 */
export function conversationExists(id) {
  const stmt = db.prepare('SELECT id FROM conversations WHERE id = ?');
  return !!stmt.get(id);
}
