// Firestore Database Service
// Handles all CRUD operations with Firebase Firestore

import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    Timestamp,
    writeBatch,
    Unsubscribe
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
    SystemSettings,
    MenuItem,
    Category,
    Order,
    Table,
    Zone,
    InventoryItem,
    Customer,
    Coupon,
    Booking,
    User,
    Role
} from '../types';

// Collection names
const COLLECTIONS = {
    SETTINGS: 'settings',
    MENU: 'menu',
    CATEGORIES: 'categories',
    ORDERS: 'orders',
    TABLES: 'tables',
    ZONES: 'zones',
    INVENTORY: 'inventory',
    CUSTOMERS: 'customers',
    COUPONS: 'coupons',
    BOOKINGS: 'bookings',
    USERS: 'users',
    ROLES: 'roles'
} as const;

// Helper to convert Firestore timestamps to Date
const convertTimestamps = <T extends Record<string, unknown>>(data: T): T => {
    const result = { ...data };
    for (const key in result) {
        if (result[key] instanceof Timestamp) {
            (result as Record<string, unknown>)[key] = (result[key] as Timestamp).toDate();
        } else if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
            (result as Record<string, unknown>)[key] = convertTimestamps(result[key] as Record<string, unknown>);
        }
    }
    return result;
};

// Helper to convert Date to Firestore Timestamp
const convertDatesToTimestamps = <T extends Record<string, unknown>>(data: T): T => {
    const result = { ...data };
    for (const key in result) {
        if (result[key] instanceof Date) {
            (result as Record<string, unknown>)[key] = Timestamp.fromDate(result[key] as Date);
        } else if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
            (result as Record<string, unknown>)[key] = convertDatesToTimestamps(result[key] as Record<string, unknown>);
        }
    }
    return result;
};

// Helper to remove undefined fields recursively
const removeUndefined = <T extends Record<string, unknown>>(data: T): T => {
    const result = { ...data };
    for (const key in result) {
        if (result[key] === undefined) {
            delete result[key];
        } else if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
            (result as Record<string, unknown>)[key] = removeUndefined(result[key] as Record<string, unknown>);
        } else if (Array.isArray(result[key])) {
            // For arrays, we might want to clean undefined items or properties inside items
            (result as Record<string, unknown>)[key] = (result[key] as any[]).map(item => {
                if (item && typeof item === 'object') return removeUndefined(item);
                return item;
            });
        }
    }
    return result;
};

// ==================== SETTINGS ====================
export const saveSettings = async (settings: SystemSettings): Promise<void> => {
    if (!db) return;
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'main');
    await setDoc(settingsRef, settings);
};

export const loadSettings = async (): Promise<SystemSettings | null> => {
    if (!db) return null;
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'main');
    const snap = await getDoc(settingsRef);
    return snap.exists() ? (snap.data() as SystemSettings) : null;
};

// ==================== MENU ====================
export const saveMenuItem = async (item: MenuItem): Promise<void> => {
    if (!db) return;
    await setDoc(doc(db, COLLECTIONS.MENU, item.id), item);
};

export const deleteMenuItemFromDb = async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.MENU, id));
};

export const loadMenu = async (): Promise<MenuItem[]> => {
    if (!db) return [];
    const snap = await getDocs(collection(db, COLLECTIONS.MENU));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }) as MenuItem);
};

// ==================== CATEGORIES ====================
export const saveCategory = async (category: Category): Promise<void> => {
    if (!db) return;
    await setDoc(doc(db, COLLECTIONS.CATEGORIES, category.id), category);
};

export const deleteCategoryFromDb = async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id));
};

export const loadCategories = async (): Promise<Category[]> => {
    if (!db) return [];
    const snap = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }) as Category);
};

// ==================== ORDERS ====================
export const saveOrder = async (order: Order): Promise<void> => {
    if (!db) {
        console.error("❌ saveOrder: DB not initialized");
        return;
    }
    console.log("💾 saving order:", order.id, order);
    try {
        const cleanOrder = removeUndefined(order as unknown as Record<string, unknown>);
        const orderData = convertDatesToTimestamps(cleanOrder);
        await setDoc(doc(db, COLLECTIONS.ORDERS, order.id), orderData);
        console.log("✅ saveOrder success:", order.id);
    } catch (e) {
        console.error("❌ saveOrder failed:", e);
    }
};

export const deleteOrderFromDb = async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.ORDERS, id));
};

export const loadOrders = async (): Promise<Order[]> => {
    if (!db) return [];
    const q = query(collection(db, COLLECTIONS.ORDERS), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
        const data = convertTimestamps(d.data() as Record<string, unknown>);
        return { ...data, id: d.id } as Order;
    });
};

export const subscribeToOrders = (callback: (orders: Order[]) => void): Unsubscribe | null => {
    if (!db) return null;
    const q = query(collection(db, COLLECTIONS.ORDERS), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => {
        const orders = snap.docs.map(d => {
            const data = convertTimestamps(d.data() as Record<string, unknown>);
            return { ...data, id: d.id } as Order;
        });
        callback(orders);
    });
};

// ==================== TABLES ====================
export const saveTable = async (table: Table): Promise<void> => {
    if (!db) return;
    await setDoc(doc(db, COLLECTIONS.TABLES, table.id), table);
};

export const deleteTableFromDb = async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.TABLES, id));
};

export const loadTables = async (): Promise<Table[]> => {
    if (!db) return [];
    const snap = await getDocs(collection(db, COLLECTIONS.TABLES));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }) as Table);
};

export const subscribeToTables = (callback: (tables: Table[]) => void): Unsubscribe | null => {
    if (!db) return null;
    return onSnapshot(collection(db, COLLECTIONS.TABLES), (snap) => {
        const tables = snap.docs.map(d => ({ ...d.data(), id: d.id }) as Table);
        callback(tables);
    });
};

// ==================== ZONES ====================
export const saveZone = async (zone: Zone): Promise<void> => {
    if (!db) return;
    await setDoc(doc(db, COLLECTIONS.ZONES, zone.id), zone);
};

export const deleteZoneFromDb = async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.ZONES, id));
};

export const loadZones = async (): Promise<Zone[]> => {
    if (!db) return [];
    const snap = await getDocs(collection(db, COLLECTIONS.ZONES));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }) as Zone);
};

// ==================== INVENTORY ====================
export const saveInventoryItem = async (item: InventoryItem): Promise<void> => {
    if (!db) return;
    const itemData = convertDatesToTimestamps(item as unknown as Record<string, unknown>);
    await setDoc(doc(db, COLLECTIONS.INVENTORY, item.id), itemData);
};

export const deleteInventoryItemFromDb = async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.INVENTORY, id));
};

export const loadInventory = async (): Promise<InventoryItem[]> => {
    if (!db) return [];
    const snap = await getDocs(collection(db, COLLECTIONS.INVENTORY));
    return snap.docs.map(d => {
        const data = convertTimestamps(d.data() as Record<string, unknown>);
        return { ...data, id: d.id } as InventoryItem;
    });
};

// ==================== CUSTOMERS ====================
export const saveCustomer = async (customer: Customer): Promise<void> => {
    if (!db) return;
    const customerData = convertDatesToTimestamps(customer as unknown as Record<string, unknown>);
    await setDoc(doc(db, COLLECTIONS.CUSTOMERS, customer.id), customerData);
};

export const deleteCustomerFromDb = async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.CUSTOMERS, id));
};

export const loadCustomers = async (): Promise<Customer[]> => {
    if (!db) return [];
    const snap = await getDocs(collection(db, COLLECTIONS.CUSTOMERS));
    return snap.docs.map(d => {
        const data = convertTimestamps(d.data() as Record<string, unknown>);
        return { ...data, id: d.id } as Customer;
    });
};

// ==================== COUPONS ====================
export const saveCoupon = async (coupon: Coupon): Promise<void> => {
    if (!db) return;
    await setDoc(doc(db, COLLECTIONS.COUPONS, coupon.id), coupon);
};

export const deleteCouponFromDb = async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.COUPONS, id));
};

export const loadCoupons = async (): Promise<Coupon[]> => {
    if (!db) return [];
    const snap = await getDocs(collection(db, COLLECTIONS.COUPONS));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }) as Coupon);
};

// ==================== BOOKINGS ====================
export const saveBooking = async (booking: Booking): Promise<void> => {
    if (!db) return;
    await setDoc(doc(db, COLLECTIONS.BOOKINGS, booking.id), booking);
};

export const deleteBookingFromDb = async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.BOOKINGS, id));
};

export const loadBookings = async (): Promise<Booking[]> => {
    if (!db) return [];
    const snap = await getDocs(collection(db, COLLECTIONS.BOOKINGS));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }) as Booking);
};

// ==================== USERS ====================
export const saveUser = async (user: User): Promise<void> => {
    if (!db) return;
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), user);
};

export const deleteUserFromDb = async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.USERS, id));
};

export const loadUsers = async (): Promise<User[]> => {
    if (!db) return [];
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }) as User);
};

// ==================== ROLES ====================
export const saveRole = async (role: Role): Promise<void> => {
    if (!db) return;
    await setDoc(doc(db, COLLECTIONS.ROLES, role.id), role);
};

export const deleteRoleFromDb = async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.ROLES, id));
};

export const loadRoles = async (): Promise<Role[]> => {
    if (!db) return [];
    const snap = await getDocs(collection(db, COLLECTIONS.ROLES));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }) as Role);
};

// ==================== BATCH OPERATIONS ====================
export const initializeDatabase = async (data: {
    settings: SystemSettings;
    menu: MenuItem[];
    categories: Category[];
    tables: Table[];
    zones: Zone[];
    inventory: InventoryItem[];
    customers: Customer[];
    coupons: Coupon[];
    bookings: Booking[];
    users: User[];
    roles: Role[];
}): Promise<void> => {
    if (!db) return;

    const batch = writeBatch(db);

    // Settings
    batch.set(doc(db, COLLECTIONS.SETTINGS, 'main'), data.settings);

    // Menu
    data.menu.forEach(item => {
        batch.set(doc(db, COLLECTIONS.MENU, item.id), item);
    });

    // Categories
    data.categories.forEach(item => {
        batch.set(doc(db, COLLECTIONS.CATEGORIES, item.id), item);
    });

    // Tables
    data.tables.forEach(item => {
        batch.set(doc(db, COLLECTIONS.TABLES, item.id), item);
    });

    // Zones
    data.zones.forEach(item => {
        batch.set(doc(db, COLLECTIONS.ZONES, item.id), item);
    });

    // Inventory
    data.inventory.forEach(item => {
        const itemData = convertDatesToTimestamps(item as unknown as Record<string, unknown>);
        batch.set(doc(db, COLLECTIONS.INVENTORY, item.id), itemData);
    });

    // Customers
    data.customers.forEach(item => {
        const itemData = convertDatesToTimestamps(item as unknown as Record<string, unknown>);
        batch.set(doc(db, COLLECTIONS.CUSTOMERS, item.id), itemData);
    });

    // Coupons
    data.coupons.forEach(item => {
        batch.set(doc(db, COLLECTIONS.COUPONS, item.id), item);
    });

    // Bookings
    data.bookings.forEach(item => {
        batch.set(doc(db, COLLECTIONS.BOOKINGS, item.id), item);
    });

    // Users
    data.users.forEach(user => {
        batch.set(doc(db, COLLECTIONS.USERS, user.id), user);
    });

    // Roles
    data.roles.forEach(item => {
        batch.set(doc(db, COLLECTIONS.ROLES, item.id), item);
    });

    // Orders (converted with timestamps)
    // Orders are usually empty on init, but included for completeness

    await batch.commit();
    console.log('✅ Database initialized with default data');
};

// Check if database has data
export const isDatabaseEmpty = async (): Promise<boolean> => {
    if (!db) return true;
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'main');
    const snap = await getDoc(settingsRef);
    return !snap.exists();
};

// Export for use in context
export const firestoreService = {
    isFirebaseConfigured,
    // Settings
    saveSettings,
    loadSettings,
    // Menu
    saveMenuItem,
    deleteMenuItemFromDb,
    loadMenu,
    // Categories
    saveCategory,
    deleteCategoryFromDb,
    loadCategories,
    // Orders
    saveOrder,
    deleteOrderFromDb,
    loadOrders,
    subscribeToOrders,
    // Tables
    saveTable,
    deleteTableFromDb,
    loadTables,
    subscribeToTables,
    // Zones
    saveZone,
    deleteZoneFromDb,
    loadZones,
    // Inventory
    saveInventoryItem,
    deleteInventoryItemFromDb,
    loadInventory,
    // Customers
    saveCustomer,
    deleteCustomerFromDb,
    loadCustomers,
    // Coupons
    saveCoupon,
    deleteCouponFromDb,
    loadCoupons,
    // Bookings
    saveBooking,
    deleteBookingFromDb,
    loadBookings,
    // Users
    saveUser,
    deleteUserFromDb,
    loadUsers,
    // Roles
    saveRole,
    deleteRoleFromDb,
    loadRoles,
    // Batch
    initializeDatabase,
    isDatabaseEmpty
};
