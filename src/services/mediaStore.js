// Keeps attached video and image files in the browser (IndexedDB).
//
// Why not localStorage? It holds only about 5 MB of text, so even a short video
// would not fit. IndexedDB can store the file itself (a Blob) with no size
// problem for normal use. The files never leave this browser unless you upload
// them yourself. They are NOT part of the JSON backup (see Settings).

const DB_NAME = 'haven-media'
const STORE = 'files'

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser does not allow saving files.'))
      return
    }
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Could not open file storage.'))
  })
}

// Runs one request inside a transaction and resolves with its result.
async function run(mode, action) {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error || new Error('File storage failed.'))
    })
  } finally {
    db.close()
  }
}

export const saveMediaFile = (id, file) => run('readwrite', (store) => store.put(file, id))
export const getMediaFile = (id) => run('readonly', (store) => store.get(id))
export const deleteMediaFile = (id) => run('readwrite', (store) => store.delete(id))
