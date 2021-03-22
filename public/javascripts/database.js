////////////////// DATABASE //////////////////
// the database receives from the server the following structure
import * as idb from './idb/index.js';

let db;

const IMAGE_DB_NAME= 'AMK_DB';
const IMAGE_STORE_NAME= 'AMK_DB_STORE';

/**
 * it inits the database
 */
async function initDatabase(){
    if (!db) {
        db = await idb.openDB(IMAGE_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(IMAGE_STORE_NAME)) {
                    let AMK_DB = upgradeDb.createObjectStore(IMAGE_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    AMK_DB.createIndex('room', 'room', {unique: true});
                }
            }
        });
        console.log('db created');
    }
}
window.initDatabase= initDatabase;
/**
 * it saves the data of a room in localStorage
 * @param room
 * @param image
 */
async function storeCachedData(room, data) {
    console.log('inserting: ');
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction([IMAGE_STORE_NAME], "readwrite");
            let store = await tx.objectStore(IMAGE_STORE_NAME);
            await store.put({room, ...data});
            await tx.done;
            console.log('added item to the store! ');
        } catch(error) {
            localStorage.setItem(room, JSON.stringify(data));
        };
    }
    else localStorage.setItem(room, JSON.stringify(data));
}
window.storeCachedData= storeCachedData;

/**
 * it retrieves the data stored for the specific room from the database
 * @param room
 * @returns {*}
 */
async function getCachedData(room) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            console.log('fetching: ' + room);
            let tx = await db.transaction(IMAGE_STORE_NAME, 'readonly');
            let store = await tx.objectStore(IMAGE_STORE_NAME);
            let index = await store.index('room');
            let roomData = await index.get(IDBKeyRange.only(room));
            await tx.done;
            return roomData
        } catch (error) {
            console.log(error);
        }
    } else {
        const roomData = localStorage.getItem(room);
        
        return roomData;
    }
}
window.getCachedData= getCachedData;

/**
 * it updates the data of a room in localStorage
 * @param image
 */
async function updateCachedData(data) {
    console.log('inserting: ');
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction([IMAGE_STORE_NAME], "readwrite");
            let store = await tx.objectStore(IMAGE_STORE_NAME);
            await store.put(data);
            await tx.complete;
            console.log('added item to the store! ');
        } catch(error) {
            console.log(error);
            localStorage.setItem(room, JSON.stringify(data));
        };
    }
    else localStorage.setItem(room, JSON.stringify(data));
}

window.updateCachedData= updateCachedData;