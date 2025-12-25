import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, addDoc, onSnapshot, collection, query, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore'; 
import { User, MessageSquare, LogIn, LayoutGrid, Send, Loader2, LogOut, Lock, AlertTriangle, Zap, UserCheck, Search, X, Calendar, Settings, Aperture, Code, Briefcase, GraduationCap, Menu, Minimize2, Users, Globe, ChevronDown, ChevronUp, Clock, Image, Sun, Moon, Languages, CalendarDays, KeyRound } from 'lucide-react';

// --- Global Variables Accessors ---
const getFirebaseConfig = () => {
    try {
        const config = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
        return JSON.parse(config);
    } catch (e) { return {}; }
};
const getAppId = () => typeof __app_id !== 'undefined' ? __app_id : 'class-12e-default';
const getInitialAuthToken = () => typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Language/I18n Setup ---
const translations = {
    en: {
        'Control Panel': 'Control Panel',
        'Comm-Link': 'Comm-Link',
        'Directory': 'Directory',
        'User Profile': 'User Profile',
        'Access': 'Access',
        'Sign Out': 'Sign Out',
        'System Status': 'System Status',
        'Faculty Status': 'Faculty Status',
        'Student Database': 'Student Database',
        'Type a message...': 'Type a message...',
        'English': 'English',
        'Khmer': 'Khmer',
        'Dark Mode': 'Dark Mode',
        'Light Mode': 'Light Mode',
        'Save Changes': 'Save Changes',
        'System User ID': 'System User ID',
        'Display Name': 'Display Name',
        'Change Photo': 'Change Photo',
        'Updating Profile...': 'Updating Profile...',
        'Sign Out of Platform': 'Sign Out of Platform',
        'System Directory': 'System Directory',
        'System ID Card': 'SYSTEM ID CARD',
        'Homeroom Lead': 'Homeroom Lead | System Admin',
        'Primary Academic and Operational Liaison for the 12E Cohort. All system queries report here.': 'Primary Academic and Operational Liaison for the 12E Cohort. All system queries report here.',
        'Student Command': 'Student Command',
        'Student ID': 'Student ID',
        'Homeroom': 'Homeroom',
        'DOB': 'DOB',
        'System ID': 'System ID',
        'TERMINATE VIEW': 'TERMINATE VIEW',
        'Real-time collaboration for Class 12E members.': 'Real-time collaboration for Class 12E members.',
        'Establishing secure connection...': 'Establishing secure connection...',
        'No messages yet. Be the first to start the conversation!': 'No messages yet. Be the first to start the conversation!',
        'You': 'You',
        'Sending...': 'Sending...',
        'Access Required': 'Access Required',
        'You must sign in to view the': 'You must sign in to view the',
        'panel.': 'panel.',
        'Authenticating...': 'Authenticating...',
        'Status:': 'Status:',
        'OPERATIONAL': 'OPERATIONAL',
        'User ID:': 'User ID:',
        'Search students by name or ID...': 'Search students by name or ID...',
        'No students match your search criteria.': 'No students match your search criteria.',
        'All authorized personnel and key student leads.': 'Listing of all authorized personnel and key student leads.',
        'Authenticated Access': 'Authenticated Access',
        'Major': 'Major',
        'Public Channel': 'Public Channel',
        'Log In': 'Log In',
        'Enter your full name': 'Enter your full name',
        'Enter your Date of Birth (MM/DD/YYYY)': 'Enter your Date of Birth (MM/DD/YYYY)',
        'Invalid Credentials': 'Invalid Credentials',
        'Name or Date of Birth does not match any record in the system.': 'Name or Date of Birth does not match any record in the system.',
        'Authentication Success': 'Authentication Success',
        'You are now authenticated. Redirecting...': 'You are now authenticated. Redirecting...',
        'Authentication Status': 'Authentication Status',
        'Unvalidated': 'Unvalidated',
        'Validated': 'Validated',
        'System ID Match': 'System ID Match',
        'Please authenticate with your credentials to access secured areas.': 'Please authenticate with your credentials to access secured areas.'
    },
    km: {
        'Control Panel': 'ផ្ទាំងគ្រប់គ្រង',
        'Comm-Link': 'តំណភ្ជាប់ទំនាក់ទំនង',
        'Directory': 'សៀវភៅបញ្ជី',
        'User Profile': 'ប្រវត្តិរូបអ្នកប្រើប្រាស់',
        'Access': 'ចូលប្រើ',
        'Sign Out': 'ចេញ',
        'System Status': 'ស្ថានភាពប្រព័ន្ធ',
        'Faculty Status': 'ស្ថានភាពមហាវិទ្យាល័យ',
        'Student Database': 'មូលដ្ឋានទិន្នន័យសិស្ស',
        'Type a message...': 'វាយបញ្ចូលសារ...',
        'English': 'ភាសាអង់គ្លេស',
        'Khmer': 'ភាសាខ្មែរ',
        'Dark Mode': 'របៀបងងឹត',
        'Light Mode': 'របៀបភ្លឺ',
        'Save Changes': 'រក្សាទុកការផ្លាស់ប្តូរ',
        'System User ID': 'លេខសម្គាល់អ្នកប្រើប្រាស់ប្រព័ន្ធ',
        'Display Name': 'ឈ្មោះសម្រាប់បង្ហាញ',
        'Change Photo': 'ផ្លាស់ប្តូររូបភាព',
        'Updating Profile...': 'កំពុងធ្វើបច្ចុប្បន្នភាព...',
        'Sign Out of Platform': 'ចេញពីប្រព័ន្ធ',
        'System Directory': 'សៀវភៅបញ្ជីប្រព័ន្ធ',
        'System ID Card': 'ប័ណ្ណសម្គាល់ប្រព័ន្ធ',
        'Homeroom Lead': 'អ្នកដឹកនាំបន្ទប់ | អ្នកគ្រប់គ្រងប្រព័ន្ធ',
        'Primary Academic and Operational Liaison for the 12E Cohort. All system queries report here.': 'អ្នកសម្របសម្រួលបឋមផ្នែកសិក្សា និងប្រតិបត្តិការសម្រាប់ក្រុម 12E។ រាល់សំណួរប្រព័ន្ធទាំងអស់ត្រូវរាយការណ៍នៅទីនេះ។',
        'Student Command': 'បញ្ជាការសិស្ស',
        'Student ID': 'លេខសម្គាល់សិស្ស',
        'Homeroom': 'បន្ទប់មូលដ្ឋាន',
        'DOB': 'ថ្ងៃខែឆ្នាំកំណើត',
        'System ID': 'លេខសម្គាល់ប្រព័ន្ធ',
        'TERMINATE VIEW': 'បញ្ចប់ការមើល',
        'Real-time collaboration for Class 12E members.': 'កិច្ចសហការតាមពេលវេលាពិតសម្រាប់សមាជិកថ្នាក់ 12E។',
        'Establishing secure connection...': 'កំពុងបង្កើតការតភ្ជាប់សុវត្ថិភាព...',
        'No messages yet. Be the first to start the conversation!': 'មិនទាន់មានសារទេ។ សូមចាប់ផ្តើមការសន្ទនា!',
        'You': 'អ្នក',
        'Sending...': 'កំពុងផ្ញើ...',
        'Access Required': 'ទាមទារការចូលប្រើ',
        'You must sign in to view the': 'អ្នកត្រូវតែចូលដើម្បីមើលផ្ទាំង',
        'panel.': 'នេះ។',
        'Authenticating...': 'កំពុងផ្ទៀងផ្ទាត់...',
        'Status:': 'ស្ថានភាព៖',
        'OPERATIONAL': 'ដំណើរការ',
        'User ID:': 'លេខសម្គាល់អ្នកប្រើប្រាស់៖',
        'Search students by name or ID...': 'ស្វែងរកសិស្សតាមឈ្មោះ ឬលេខសម្គាល់...',
        'No students match your search criteria.': 'មិនមានសិស្សណាមួយត្រូវគ្នានឹងលក្ខណៈវិនិច្ឆ័យស្វែងរករបស់អ្នកទេ។',
        'All authorized personnel and key student leads.': 'បញ្ជីឈ្មោះបុគ្គលិកដែលមានការអនុញ្ញាតទាំងអស់ និងអ្នកដឹកនាំសិស្សសំខាន់ៗ។',
        'Authenticated Access': 'ការចូលប្រើដែលមានការអនុញ្ញាត',
        'Major': 'ជំនាញ',
        'Public Channel': 'បណ្តាញសាធារណៈ',
        'Log In': 'ចូល',
        'Enter your full name': 'បញ្ចូលឈ្មោះពេញរបស់អ្នក',
        'Enter your Date of Birth (MM/DD/YYYY)': 'បញ្ចូលថ្ងៃខែឆ្នាំកំណើតរបស់អ្នក (MM/DD/YYYY)',
        'Invalid Credentials': 'ព័ត៌មានសម្គាល់មិនត្រឹមត្រូវ',
        'Name or Date of Birth does not match any record in the system.': 'ឈ្មោះ ឬថ្ងៃខែឆ្នាំកំណើតមិនត្រូវគ្នានឹងកំណត់ត្រាណាមួយនៅក្នុងប្រព័ន្ធទេ។',
        'Authentication Success': 'ការផ្ទៀងផ្ទាត់បានជោគជ័យ',
        'You are now authenticated. Redirecting...': 'អ្នកត្រូវបានផ្ទៀងផ្ទាត់ហើយ។ កំពុងបញ្ជូនបន្ត...',
        'Authentication Status': 'ស្ថានភាពនៃការផ្ទៀងផ្ទាត់',
        'Unvalidated': 'មិនបានផ្ទៀងផ្ទាត់',
        'Validated': 'បានផ្ទៀងផ្ទាត់',
        'System ID Match': 'លេខសម្គាល់ប្រព័ន្ធផ្គូផ្គង',
        'Please authenticate with your credentials to access secured areas.': 'សូមផ្ទៀងផ្ទាត់ជាមួយព័ត៌មានសម្គាល់របស់អ្នកដើម្បីចូលប្រើតំបន់សុវត្ថិភាព។'
    }
};

// --- Firebase Instances ---
let authInstance = null;
let dbInstance = null;
const appId = getAppId();

// Helper for Firebase retry logic (Exponential Backoff)
const withRetry = (fn, maxRetries = 3, delay = 1000) => async (...args) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn(...args);
        } catch (error) {
            if (error.code && error.code.includes('auth/')) {
                throw error;
            }
            if (i === maxRetries - 1) {
                console.error(`Firebase operation failed after ${maxRetries} attempts:`, error);
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delay * (2 ** i)));
        }
    }
};

// --- Student and Faculty Data (Simulated Database) ---
// Note: DOB is formatted as MM/DD/YYYY for simple string matching.
// Sample test user: Name: Student 4 Name, DOB: 01/1/2007
const students = Array.from({ length: 66 }, (_, i) => ({
    name: `Student ${i + 4} Name`, 
    id: (i + 100).toString().padStart(3, '0'),
    dob: `01/${(i % 12) + 1}/2007`,
    homeroom: '12E',
    major: ['Science', 'Commerce', 'Arts'][i % 3],
    photo: `https://placehold.co/100x100/1E3A8A/BFDBFE?text=ID${(i + 100)}`
}));

const teachers = [
    { 
        name: 'Mrs. Evelyn Clark', 
        role: 'Homeroom Teacher, Science', 
        initials: 'EC', 
        avatar: 'https://placehold.co/100x100/1E40AF/FFFFFF?text=E.C.',
        isHomeroom: true
    },
    { name: 'Mr. Alex Reid', role: 'Mathematics', initials: 'AR', avatar: 'https://placehold.co/40x40/6366F1/FFFFFF?text=A.R.' },
    { name: 'Ms. Nina Chen', role: 'History', initials: 'NC', avatar: 'https://placehold.co/40x40/4F46E5/FFFFFF?text=N.C.' },
    { name: 'Dr. Liam Jones', role: 'Chemistry', initials: 'LJ', avatar: 'https://placehold.co/40x40/059669/FFFFFF?text=L.J.' },
    { name: 'Mr. David Lee', role: 'Physics', initials: 'DL', avatar: 'https://placehold.co/40x40/F59E0B/FFFFFF?text=D.L.' },
    { name: 'Ms. Sarah King', role: 'Literature', initials: 'SK', avatar: 'https://placehold.co/40x40/DB2777/FFFFFF?text=S.K.' },
    { name: 'Mr. Tom Wilson', role: 'Computing', initials: 'TW', avatar: 'https://placehold.co/40x40/1D4ED8/FFFFFF?text=T.W.' },
];


// --- App Component ---
const App = () => {
    // --- State Management ---
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [currentPage, setCurrentPage] = useState('portfolio'); 
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(true);
    const [profileData, setProfileData] = useState({});
    const [isProfileValidated, setIsProfileValidated] = useState(false); // New state for custom login validation
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null); 
    const [showError, setShowError] = useState(null); 
    
    // Theme and Language States
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

    const messagesEndRef = useRef(null);

    // --- Localization Function ---
    const t = useCallback((key) => {
        return translations[language][key] || key;
    }, [language]);

    // --- Theme Logic ---
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };
    
    // --- Language Logic ---
    const switchLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };


    // --- Utility Functions ---
    const displayError = (message, type = 'error') => {
        setShowError({ message: message, type });
        setTimeout(() => setShowError(null), 5000);
    };

    const fetchUserProfile = async (currentUser) => {
        if (!dbInstance || !currentUser || !currentUser.uid) {
             setProfileData({});
             setIsProfileValidated(false);
             return;
        }

        const uid = currentUser.uid;
        const profilePath = `artifacts/${appId}/users/${uid}/user_profile/doc`; 
        const profileRef = doc(dbInstance, profilePath);
        
        try {
            const profileSnap = await withRetry(getDoc)(profileRef);
            if (profileSnap.exists()) {
                const data = profileSnap.data();
                setProfileData(data);
                setIsProfileValidated(!!data.is_validated); // Check the validation flag
            } else {
                // Initialize a minimal, unvalidated profile if none exists
                const defaultProfile = { 
                    photoURL: null, 
                    name: `User ${uid.substring(0, 8)}`,
                    is_validated: false,
                    student_id: null
                };
                await withRetry(setDoc)(profileRef, defaultProfile);
                setProfileData(defaultProfile);
                setIsProfileValidated(false);
            }
        } catch (e) {
            console.error("Error fetching/initializing profile:", e);
            displayError("Profile data could not be initialized.");
            setIsProfileValidated(false);
        }
    };
    
    // 1. Firebase Initialization and Auth
    useEffect(() => {
        const firebaseConfig = getFirebaseConfig();
        if (Object.keys(firebaseConfig).length === 0) {
            setIsAuthReady(true);
            return;
        }
        
        try {
            const app = initializeApp(firebaseConfig);
            authInstance = getAuth(app);
            dbInstance = getFirestore(app);
            
            const signInAndListen = async () => {
                const token = getInitialAuthToken();
                try {
                    if (token) {
                        await withRetry(signInWithCustomToken)(authInstance, token);
                    } else {
                        // Fallback to anonymous sign-in is essential for firestore access
                        await withRetry(signInAnonymously)(authInstance);
                    }
                } catch (e) {
                    console.error("Initial sign-in failed, falling back to anonymous:", e);
                    await signInAnonymously(authInstance); 
                }
                
                const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
                    if (currentUser) {
                        setUser(currentUser);
                        setUserId(currentUser.uid); 
                        await fetchUserProfile(currentUser); 
                    } else {
                        setUserId(null); 
                        setUser(null);
                        setProfileData({});
                        setIsProfileValidated(false);
                    }
                    setIsAuthReady(true);
                });
                return () => unsubscribe();
            };
            signInAndListen();
        } catch (e) {
            console.error("Firebase Init error:", e);
            setIsAuthReady(true); 
        }
    }, []);

    // 2. Real-time Chat Listener
    useEffect(() => {
        // Only proceed if auth is complete, DB is ready, and user's profile is validated
        if (!isAuthReady || !dbInstance || !isProfileValidated) { 
            setChatLoading(true);
            setMessages([]);
            return;
        }
        
        // Use Public path for a collaborative chat
        const chatPath = `artifacts/${appId}/public/data/class_12e_chat`;
        const q = collection(dbInstance, chatPath);
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            msgs.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
            
            setMessages(msgs);
            setChatLoading(false);
        }, (error) => {
            console.error("Error fetching chat messages:", error);
            setChatLoading(false);
            displayError("Failed to load chat messages.");
        });

        return () => unsubscribe();
    }, [isAuthReady, isProfileValidated]); 

    // Scroll to bottom of chat
    useEffect(() => {
        if (currentPage === 'chat') {
            const timeoutId = setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100); 
            return () => clearTimeout(timeoutId);
        }
    }, [messages, currentPage]);


    // --- Custom Login Handler ---
    const handleCustomLogin = async (loginName, loginDob) => {
        if (!user || !dbInstance) {
            displayError("System is not ready. Please wait for initialization.");
            return;
        }

        // 1. Find matching student record (case-insensitive for name, exact for DOB)
        const trimmedName = loginName.trim().toLowerCase();
        const trimmedDob = loginDob.trim();

        const studentMatch = students.find(s => 
            s.name.toLowerCase() === trimmedName && s.dob === trimmedDob
        );

        if (!studentMatch) {
            displayError(t('Name or Date of Birth does not match any record in the system.'));
            return false;
        }

        // 2. If matched, update the user's private profile
        try {
            const profilePath = `artifacts/${appId}/users/${user.uid}/user_profile/doc`;
            const profileRef = doc(dbInstance, profilePath);
            
            const validatedProfileData = {
                name: studentMatch.name,
                student_id: studentMatch.id,
                major: studentMatch.major,
                dob: studentMatch.dob,
                photoURL: studentMatch.photo, // Use specific student photo
                is_validated: true, // Crucial flag for access control
            };

            await withRetry(setDoc)(profileRef, validatedProfileData, { merge: true });
            
            // 3. Update local state
            setProfileData(prev => ({ ...prev, ...validatedProfileData }));
            setIsProfileValidated(true);
            displayError(t('You are now authenticated. Redirecting...'), "success");
            setCurrentPage('chat'); // Redirect to chat or control panel
            return true;

        } catch (error) {
            console.error("Custom login/profile update failed:", error);
            displayError("A system error occurred during login. Try again.");
            return false;
        }
    };

    const handleSignOut = async () => {
        if (!authInstance) return;
        try {
            // We only sign out of the Firebase auth session
            await signOut(authInstance);
            
            // Reset local profile validation state
            setIsProfileValidated(false); 
            setProfileData({});
            setCurrentPage('portfolio');
            // The platform will automatically sign the user back in anonymously upon refresh/reload
        } catch (error) {
            console.error("Sign out failed:", error);
            displayError("Sign out process failed.");
        }
    };

    // --- Chat Handlers ---
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !dbInstance || !isProfileValidated) {
            displayError("Message cannot be empty or authentication is incomplete.");
            return;
        }
        
        const chatPath = `artifacts/${appId}/public/data/class_12e_chat`;
        const userName = profileData.name || `User ${user.uid.substring(0, 6)}`;
        const userPhoto = profileData.photoURL || null;

        const messageData = {
            text: newMessage,
            timestamp: serverTimestamp(),
            uid: user.uid, 
            name: userName,
            avatar: userPhoto
        };

        try {
            await withRetry(addDoc)(collection(dbInstance, chatPath), messageData);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            displayError("Failed to send message. Please try again.");
        }
    };

    // --- Utility Components ---
    const UserAvatar = ({ src, name, size = 'w-10 h-10', textStyle = 'text-sm' }) => {
        const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'AN';
        return (
            <img 
                src={src || `https://placehold.co/40x40/1E3A8A/BFDBFE?text=${initials}`} 
                alt={name} 
                className={`${size} rounded-full object-cover border-2 border-indigo-400 dark:border-indigo-600`}
                onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = `https://placehold.co/40x40/1E3A8A/BFDBFE?text=${initials}`;
                    e.target.className = `${size} rounded-full flex items-center justify-center bg-indigo-700 text-white font-bold ${textStyle}`;
                }}
            />
        );
    };

    const StatusAlert = ({ message, type = 'error' }) => {
        if (!message) return null;
        const baseClasses = "fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-xl shadow-2xl z-[100] flex items-center transition-all duration-300";
        const style = type === 'error' 
            ? "bg-red-600 text-white" 
            : "bg-green-500 text-white";
        const Icon = type === 'error' ? AlertTriangle : UserCheck;

        return (
            <div className={`${baseClasses} ${style}`}>
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-semibold">{message}</span>
            </div>
        );
    };

    // --- UI Components ---
    
    const NavButton = ({ keyName, icon: Icon, label, color, isMobile = false }) => {
        const isActive = currentPage === keyName;
        
        // Check for required validation before enabling button
        const requiresValidation = ['chat', 'account'].includes(keyName);
        const isDisabled = requiresValidation && !isProfileValidated;
        
        const baseClasses = isMobile 
            ? "flex items-center p-3 w-full rounded-lg text-lg font-semibold transition duration-200"
            : "flex items-center p-2 rounded-lg transition duration-300 text-sm font-semibold border-2";

        const activeClasses = isMobile
            ? `bg-${color}-700/30 text-${color}-300`
            : `bg-${color}-800/50 text-${color}-200 border-${color}-600 shadow-lg shadow-${color}-900/50`;

        const inactiveClasses = isMobile
            ? `text-gray-300 hover:bg-gray-700`
            : `text-gray-400 dark:border-gray-700 border-gray-300 dark:hover:bg-gray-700 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900`;
            
        const disabledClasses = "opacity-50 cursor-not-allowed";

        return (
            <button 
                key={keyName}
                onClick={() => {
                    if (!isDisabled) {
                        setCurrentPage(keyName);
                        if (isMobile) setIsMobileMenuOpen(false); 
                    } else {
                         setCurrentPage('login'); // Redirect to login if unvalidated
                    }
                }}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${isDisabled ? disabledClasses : ''}`}
                disabled={isDisabled}
                title={isDisabled ? "Requires successful login" : t(label)}
            >
                <Icon className={`w-5 h-5 mr-2 ${isDisabled ? 'text-gray-500' : (isActive ? 'text-white' : `text-${color}-400`)}`} /> 
                <span className="truncate">{t(label)}</span>
            </button>
        );
    };
    
    // Navigation items configuration
    const navItems = [
        { keyName: 'portfolio', icon: LayoutGrid, label: 'Control Panel', color: 'indigo' },
        { keyName: 'chat', icon: MessageSquare, label: 'Comm-Link', color: 'blue', authenticated: true },
        { keyName: 'contact', icon: Users, label: 'Directory', color: 'green' },
        { keyName: 'account', icon: Settings, label: 'User Profile', color: 'orange', authenticated: true },
    ];
    
    const Header = () => (
        <header className="bg-gray-900 dark:bg-gray-900 dark:border-b-indigo-700/50 border-b border-indigo-200/50 shadow-lg sticky top-0 z-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-4 sm:px-6">
                <div className="flex items-center space-x-3">
                    <Aperture className="w-8 h-8 text-indigo-400 animate-spin-slow" />
                    <h1 className="text-xl sm:text-2xl font-extrabold dark:text-white text-gray-900 tracking-widest font-['Inter'] transition-colors duration-300">
                        <span className="text-indigo-400">12E</span> PLATFORM
                    </h1>
                </div>
                
                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-gray-400 dark:text-gray-300 dark:bg-gray-800 bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-300 border-2 dark:border-gray-700 border-gray-300"
                    >
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                    </button>
                    
                    {/* Language Switch */}
                    <div className="relative group">
                        <button className="flex items-center p-2 rounded-lg text-gray-400 dark:text-gray-300 dark:bg-gray-800 bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-300 border-2 dark:border-gray-700 border-gray-300">
                            <Languages className="w-5 h-5 mr-1" />
                            <span className="text-sm font-semibold uppercase">{language}</span>
                        </button>
                        <div className="absolute right-0 mt-2 w-32 rounded-lg shadow-xl bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 hidden group-hover:block z-50">
                            <button onClick={() => switchLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-500 hover:text-white rounded-t-lg">
                                {t('English')}
                            </button>
                            <button onClick={() => switchLanguage('km')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-500 hover:text-white rounded-b-lg">
                                {t('Khmer')}
                            </button>
                        </div>
                    </div>


                    {navItems
                        .filter(item => !item.authenticated || user)
                        .map(item => (
                            <NavButton 
                                key={item.keyName} 
                                keyName={item.keyName} 
                                icon={item.icon} 
                                label={item.label} 
                                color={item.color}
                            />
                        ))}

                    {/* Auth Button */}
                    {isProfileValidated ? (
                        <button onClick={handleSignOut} className="flex items-center p-2 rounded-lg bg-red-700 text-white font-semibold hover:bg-red-600 transition duration-300 text-sm shadow-lg shadow-red-900/50">
                            <LogOut className="w-4 h-4" />
                        </button>
                    ) : (
                        <button onClick={() => setCurrentPage('login')} className="flex items-center p-2 rounded-lg bg-indigo-600 text-white font-bold transition duration-300 text-sm hover:bg-indigo-500 shadow-lg shadow-indigo-900/50">
                            <KeyRound className="w-4 h-4 mr-1" /> {t('Log In')}
                        </button>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="sm:hidden p-2 rounded-full text-indigo-400 hover:bg-gray-700 dark:hover:bg-gray-700 transition duration-200"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Content (Slide-in) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/70 z-40 sm:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div 
                        className="absolute right-0 top-0 h-full w-64 bg-gray-800 dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                            <h2 className="text-lg font-bold text-white">SYSTEM NAV</h2>
                            <button
                                className="text-gray-400 hover:text-white"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-col space-y-2 p-4">
                            {/* Theme/Language in Mobile Menu */}
                            <div className="flex justify-between space-x-2 pb-2 border-b border-gray-700">
                                <button 
                                    onClick={toggleTheme} 
                                    className="flex-1 p-3 rounded-lg text-sm font-semibold text-gray-300 hover:bg-gray-700 flex items-center justify-center transition"
                                >
                                    {theme === 'dark' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2 text-yellow-500" />}
                                    {t(theme === 'dark' ? 'Dark Mode' : 'Light Mode')}
                                </button>
                                <button 
                                    onClick={() => switchLanguage(language === 'en' ? 'km' : 'en')}
                                    className="flex-1 p-3 rounded-lg text-sm font-semibold text-gray-300 hover:bg-gray-700 flex items-center justify-center transition"
                                >
                                    <Languages className="w-4 h-4 mr-2" />
                                    {t(language === 'en' ? 'Khmer' : 'English')}
                                </button>
                            </div>

                            {navItems
                                .filter(item => !item.authenticated || user)
                                .map(item => (
                                    <NavButton 
                                        key={item.keyName} 
                                        keyName={item.keyName} 
                                        icon={item.icon} 
                                        label={item.label} 
                                        color={item.color}
                                        isMobile={true}
                                    />
                                ))}
                            
                            <div className="pt-4 border-t mt-4 border-gray-700">
                                {isProfileValidated ? (
                                    <button 
                                        onClick={handleSignOut} 
                                        className="flex items-center p-3 w-full rounded-lg text-lg font-semibold text-red-400 hover:bg-red-700/30 transition duration-200"
                                    ><LogOut className="w-5 h-5 mr-2" /> {t('Sign Out')}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => { setCurrentPage('login'); setIsMobileMenuOpen(false); }} 
                                        className="flex items-center p-3 w-full rounded-lg text-lg font-semibold text-indigo-400 hover:bg-indigo-700/30 transition duration-200"
                                    >
                                        <LogIn className="w-5 h-5 mr-2" /> {t('Log In')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );

    // --- ID Card Modal Component ---
    const StudentIdCardModal = ({ student, onClose }) => {
        if (!student) return null;

        return (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div 
                    className="bg-gray-800 dark:bg-gray-800 rounded-xl border-2 border-indigo-600 shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100 hover:scale-[1.01]"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <div className="p-6">
                        <div className="flex justify-between items-start border-b border-gray-700 pb-3 mb-4">
                            <h3 className="text-xl font-bold text-indigo-400 flex items-center">
                                <UserCheck className="w-5 h-5 mr-2 text-green-400" /> {t('System ID Card')}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-center space-y-4">
                            <img 
                                src={student.photo} 
                                alt={student.name} 
                                className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/1E3A8A/BFDBFE?text=ID"; }}
                            />
                            <div className="text-center">
                                <p className="text-2xl font-extrabold dark:text-white text-gray-900 mt-1 mb-2">{student.name}</p>
                                <p className="text-md text-indigo-400 font-mono mt-1">{t(student.major)} {t('Major')}</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 space-y-3 bg-gray-700/50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium dark:text-gray-300 text-gray-600 flex items-center"><Code className="w-4 h-4 mr-2 text-indigo-400"/> {t('System ID')}:</span>
                                <span className="text-sm font-mono dark:text-white text-gray-900 bg-indigo-700/50 dark:bg-indigo-700/50 px-2 py-0.5 rounded">{student.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium dark:text-gray-300 text-gray-600 flex items-center"><Users className="w-4 h-4 mr-2 text-indigo-400"/> {t('Homeroom')}:</span>
                                <span className="text-sm font-mono dark:text-white text-gray-900">{student.homeroom}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium dark:text-gray-300 text-gray-600 flex items-center"><Calendar className="w-4 h-4 mr-2 text-indigo-400"/> {t('DOB')}:</span>
                                <span className="text-sm font-mono dark:text-white text-gray-900">{student.dob}</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 text-center">
                            <button onClick={onClose} className="w-full p-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition shadow-lg">
                                {t('TERMINATE VIEW')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    const PortfolioView = () => {
        const [searchTerm, setSearchTerm] = useState('');
        const [showStudents, setShowStudents] = useState(false); 

        const filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            student.id.includes(searchTerm)
        );
        
        const homeroomTeacher = teachers.find(t => t.isHomeroom);
        const regularTeachers = teachers.filter(t => !t.isHomeroom);

        const leadership = [{ name: 'First President', role: 'Head Student Council', icon: 'Code' },
            { name: 'Second President', role: 'Vice President', icon: 'Zap' },
            { name: 'Third President', role: 'Secretary', icon: 'Globe' },
        ];

        const getIcon = (iconName) => {
            switch (iconName) {
                case 'Code': return <Code className="w-6 h-6 text-indigo-400" />;
                case 'Zap': return <Zap className="w-6 h-6 text-blue-400" />;
                case 'Globe': return <Globe className="w-6 h-6 text-green-400" />;
                default: return <User className="w-6 h-6 text-gray-400" />;
            }
        };

        const SectionHeader = ({ title, count, color = 'indigo' }) => (
            <h2 className={`text-2xl font-bold dark:text-gray-200 text-gray-700 text-center mt-10 mb-5 dark:border-b-gray-700 border-b border-gray-300 pb-2 uppercase tracking-wider transition-colors duration-300`}>
                <span className={`text-${color}-400`}>{t(title)}</span> <span className={`dark:text-gray-500 text-gray-500 font-light text-base`}>({count})</span>
            </h2>
        );

        const HomeroomTeacherCard = ({ t: teacher }) => (
            <div className="dark:bg-gray-800 bg-white p-6 rounded-xl border-t-4 border-indigo-500 shadow-2xl dark:shadow-indigo-900/40 shadow-indigo-200/50 transition-colors duration-300">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    <div className="flex-shrink-0">
                        <img 
                            src={teacher.avatar} 
                            alt={teacher.name} 
                            className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-md"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/1E40AF/FFFFFF?text=EC"; }}
                        />
                    </div>
                    
                    <div className="text-center md:text-left">
                        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{t('Homeroom Lead')}</p>
                        <h3 className="text-3xl font-extrabold dark:text-white text-gray-900 mt-1 mb-2">{teacher.name}</h3>
                        <div className="flex items-center justify-center md:justify-start text-lg text-gray-400 space-x-3">
                            <GraduationCap className="w-5 h-5 text-green-500" />
                            <span>{t(teacher.role)}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 max-w-sm">
                            {t('Primary Academic and Operational Liaison for the 12E Cohort. All system queries report here.')}
                        </p>
                    </div>
                </div>
            </div>
        );
        
        const RegularTeacherCard = ({ t: teacher }) => (
            <div className="group dark:bg-gray-800 bg-white p-4 rounded-lg flex items-center space-x-4 transition duration-200 shadow-md dark:border dark:border-gray-700 border border-gray-300 hover:border-blue-500 dark:hover:shadow-lg hover:shadow-md dark:hover:bg-gray-700/50 hover:bg-gray-50">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-700 text-white font-bold text-sm shadow-inner">
                    {teacher.initials}
                </div>
                <div>
                    <p className="text-base font-semibold dark:text-white text-gray-900 group-hover:text-blue-400 transition">{teacher.name}</p>
                    <p className="text-sm dark:text-gray-400 text-gray-500">{t(teacher.role)}</p>
                </div>
            </div>
        );
        
        const StudentCard = ({ student }) => (
            <button 
                onClick={() => setSelectedStudent(student)}
                className="group dark:bg-gray-800 bg-white p-4 rounded-lg flex flex-col items-center text-center space-y-3 transition duration-300 shadow-xl dark:border dark:border-gray-700 border border-gray-300 hover:border-green-500 dark:hover:bg-gray-700/50 hover:bg-gray-50 hover:scale-[1.03] w-full"
            >
                <img 
                    src={student.photo} 
                    alt={student.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 group-hover:border-green-500 transition"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/1E3A8A/BFDBFE?text=${student.id}`; }}
                />
                <div className="flex-grow">
                    <p className="text-base font-semibold dark:text-white text-gray-900 truncate w-full">{student.name}</p>
                    <p className="text-xs dark:text-gray-400 text-gray-500 font-mono mt-1">{t(student.major)}</p>
                </div>
                <div className="text-xs font-mono text-green-500 dark:bg-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">
                    {t('ID')}: {student.id}
                </div>
            </button>
        );

        return (
            <div className="max-w-7xl mx-auto p-4 space-y-8 mt-4">
                {/* Status Bar */}
                <div className="dark:bg-gray-800 bg-white p-4 rounded-xl shadow-lg border dark:border-indigo-700/50 border-indigo-200/50 transition-colors duration-300">
                    <div className="flex justify-between items-center text-sm">
                        <p className="dark:text-gray-400 text-gray-600 flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-indigo-400" />
                            {t('Status:')} <span className="ml-2 font-bold text-green-400">{t('OPERATIONAL')}</span>
                        </p>
                        <p className="dark:text-gray-400 text-gray-600 text-right">
                            <span className="font-bold dark:text-white text-gray-900 block sm:inline">{t('User ID:')}</span> 
                            <span className="dark:bg-gray-700 bg-gray-200 text-xs dark:text-gray-300 text-gray-700 p-1 rounded-md ml-1 font-mono">{userId?.substring(0, 16)}...</span>
                        </p>
                        <p className="dark:text-gray-400 text-gray-600 text-right">
                            <span className="font-bold dark:text-white text-gray-900 block sm:inline">{t('Authentication Status')}:</span> 
                            <span className={`text-xs p-1 rounded-md ml-1 font-mono font-semibold ${isProfileValidated ? 'bg-green-700/50 text-green-300' : 'bg-red-700/50 text-red-300'}`}>
                                {isProfileValidated ? t('Validated') : t('Unvalidated')}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Teachers Section */}
                <SectionHeader title="Faculty Status" count={teachers.length} color="indigo" />
                
                {homeroomTeacher && <HomeroomTeacherCard t={homeroomTeacher} />}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularTeachers.map((t, i) => (
                        <RegularTeacherCard key={i} t={t} />
                    ))}
                </div>


                {/* Leadership Section */}
                <SectionHeader title="Student Command" count={leadership.length} color="green" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {leadership.map((p, i) => (
                        <div key={i} className="dark:bg-gray-800 bg-white p-5 rounded-xl border-b-4 border-green-500/50 transition duration-150 shadow-lg dark:hover:shadow-green-900/50 hover:shadow-green-200/50">
                            {getIcon(p.icon)}
                            <p className="text-xl font-bold dark:text-white text-gray-900 mt-3">{p.name}</p>
                            <p className="text-sm text-green-400 font-mono mt-1">{p.role}</p>
                        </div>
                    ))}
                </div>
                
                {/* Student Directory Section */}
                <div className="dark:bg-gray-800 bg-white p-6 rounded-xl border dark:border-gray-700 border-gray-300 shadow-xl transition-colors duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <SectionHeader title="Student Database" count={students.length} color="blue" />
                        <button 
                            onClick={() => setShowStudents(!showStudents)} 
                            className="p-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-500 transition-all duration-300"
                            aria-expanded={showStudents}
                        >
                            {showStudents ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-500 text-gray-400" />
                        <input 
                            type="text"
                            placeholder={t('Search students by name or ID...')}
                            className="w-full p-3 pl-10 dark:bg-gray-900 bg-gray-100 dark:text-white text-gray-900 border dark:border-gray-700 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* Student Grid (Only renders if toggled) */}
                    <div 
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                            showStudents ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, i) => (
                                    <StudentCard key={i} student={student} />
                                ))
                            ) : (
                                <p className="dark:text-gray-500 text-gray-600 col-span-full text-center py-10">{t('No students match your search criteria.')}</p>
                            )}
                        </div>
                    </div>
                </div>
                
                {selectedStudent && <StudentIdCardModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
            </div>
        );
    };

    const ChatView = () => {
        if (!isProfileValidated) return <LoginView requiredPage={t('Comm-Link')} />;
        
        return (
            <div className="flex flex-col h-[calc(100vh-64px)] dark:bg-gray-900 bg-gray-100 dark:text-white text-gray-900 p-4 max-w-7xl mx-auto transition-colors duration-300">
                <div className="flex-shrink-0 dark:bg-gray-800 bg-white p-4 rounded-t-xl dark:border-b-indigo-700 border-b border-indigo-200 shadow-lg">
                    <h2 className="text-2xl font-bold text-indigo-400 flex items-center">
                        <MessageSquare className="w-6 h-6 mr-2 text-blue-400" /> {t('Comm-Link')} ({t('Public Channel')})
                    </h2>
                    <p className="text-sm dark:text-gray-500 text-gray-600 mt-1">{t('Real-time collaboration for Class 12E members.')}</p>
                </div>
                
                {/* Message Display Area */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 dark:bg-gray-900 bg-gray-100 dark:border-x dark:border-gray-800 border-x border-gray-300">
                    {chatLoading ? (
                        <div className="flex flex-col items-center justify-center h-full dark:text-gray-500 text-gray-600">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                            <p>{t('Establishing secure connection...')}</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-10 dark:bg-gray-800 bg-white rounded-xl dark:text-gray-500 text-gray-600">
                            <Zap className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                            <p>{t('No messages yet. Be the first to start the conversation!')}</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`flex items-end space-x-3 ${msg.uid === user?.uid ? 'justify-end' : 'justify-start'}`}>
                                {msg.uid !== user?.uid && <UserAvatar src={msg.avatar} name={msg.name} size="w-8 h-8" />}
                                <div className={`max-w-xs sm:max-w-md p-3 rounded-xl shadow-md ${
                                    msg.uid === user?.uid 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'dark:bg-gray-800 bg-white dark:text-gray-200 text-gray-900 rounded-bl-none dark:border dark:border-gray-700 border border-gray-300'
                                }`}>
                                    <p className={`text-xs font-semibold mb-1 ${msg.uid === user?.uid ? 'text-indigo-200' : 'text-blue-400'}`}>
                                        {msg.uid === user?.uid ? t('You') : msg.name}
                                    </p>
                                    <p className="break-words">{msg.text}</p>
                                    <span className={`block mt-1 text-right text-[10px] ${msg.uid === user?.uid ? 'text-indigo-300' : 'dark:text-gray-400 text-gray-500'}`}>
                                        {msg.timestamp?.toDate().toLocaleTimeString() || t('Sending...')}
                                    </span>
                                </div>
                                {msg.uid === user?.uid && <UserAvatar src={profileData.photoURL} name={profileData.name} size="w-8 h-8" />}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <form onSubmit={sendMessage} className="flex-shrink-0 p-4 dark:bg-gray-800 bg-white rounded-b-xl dark:border-t dark:border-indigo-700 border-t border-indigo-200 shadow-xl">
                    <div className="flex space-x-3">
                        <input 
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('Type a message...')}
                            className="flex-grow p-3 dark:bg-gray-700 bg-gray-100 dark:text-white text-gray-900 border dark:border-gray-600 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:placeholder-gray-400 placeholder-gray-500"
                            disabled={!isProfileValidated}
                        />
                        <button 
                            type="submit" 
                            className="p-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition duration-300 shadow-md flex items-center justify-center disabled:bg-gray-600"
                            disabled={!isProfileValidated || !newMessage.trim()}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const LoginView = ({ requiredPage }) => {
        const [loginName, setLoginName] = useState('');
        const [loginDob, setLoginDob] = useState('');
        const [isLoading, setIsLoading] = useState(false);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsLoading(true);
            try {
                await handleCustomLogin(loginName, loginDob);
            } catch (e) {
                // Error already handled by handleCustomLogin
            } finally {
                setIsLoading(false);
            }
        };

        // If the user has a Firebase ID but is not validated, show the login form
        if (user && !isProfileValidated) {
            return (
                <div className="min-h-[calc(100vh-64px)] flex items-center justify-center dark:bg-gray-900 bg-gray-100 p-4 transition-colors duration-300">
                    <div className="max-w-md w-full dark:bg-gray-800 bg-white p-8 rounded-xl shadow-2xl border-t-4 border-indigo-500 text-center transition-colors duration-300">
                        <KeyRound className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
                        <h2 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">{t('Authenticated Access')}</h2>
                        <p className="dark:text-gray-400 text-gray-600 mb-6">
                            {t('Please authenticate with your credentials to access secured areas.')}
                        </p>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Input */}
                            <div>
                                <label htmlFor="loginName" className="sr-only">{t('Display Name')}</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-500 text-gray-400" />
                                    <input 
                                        id="loginName"
                                        type="text"
                                        value={loginName}
                                        onChange={(e) => setLoginName(e.target.value)}
                                        placeholder={t('Enter your full name')}
                                        className="w-full p-3 pl-10 dark:bg-gray-700 bg-gray-100 dark:text-white text-gray-900 border dark:border-gray-600 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* DOB Input */}
                            <div>
                                <label htmlFor="loginDob" className="sr-only">{t('DOB')}</label>
                                <div className="relative">
                                    <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-500 text-gray-400" />
                                    <input 
                                        id="loginDob"
                                        type="text"
                                        value={loginDob}
                                        onChange={(e) => setLoginDob(e.target.value)}
                                        placeholder={t('Enter your Date of Birth (MM/DD/YYYY)')}
                                        className="w-full p-3 pl-10 dark:bg-gray-700 bg-gray-100 dark:text-white text-gray-900 border dark:border-gray-600 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-left px-1">Example: 01/1/2007</p>
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit"
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition duration-300 shadow-md flex items-center justify-center disabled:bg-gray-600"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                                ) : (
                                    <LogIn className="w-5 h-5 mr-3" />
                                )}
                                {t('Log In')}
                            </button>
                        </form>
                    </div>
                </div>
            );
        }

        // Fallback for uninitialized state (should be covered by isAuthReady check, but safe to include)
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center dark:bg-gray-900 bg-gray-100 p-4 transition-colors duration-300">
                <div className="max-w-md w-full dark:bg-gray-800 bg-white p-8 rounded-xl shadow-2xl border-t-4 border-red-500 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                    <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">{t('Access Required')}</h2>
                    <p className="dark:text-gray-400 text-gray-600 mb-6">{t('Please wait for the system to initialize.')}</p>
                </div>
            </div>
        );
    };
    
    // Placeholder for Contact/Directory View
    const DirectoryView = () => {
        const directory = [...teachers, ...students.slice(0, 10).map(s => ({ ...s, isStudent: true }))];
        
        return (
            <div className="max-w-5xl mx-auto p-4 mt-4 space-y-6">
                <div className="dark:bg-gray-800 bg-white p-6 rounded-xl border dark:border-green-700/50 border-green-200/50 shadow-lg transition-colors duration-300">
                    <h2 className="text-3xl font-bold text-green-400 flex items-center mb-4 border-b dark:border-gray-700 border-gray-300 pb-2">
                        <Briefcase className="w-6 h-6 mr-3 text-yellow-400" /> {t('System Directory')}
                    </h2>
                    <p className="dark:text-gray-400 text-gray-600 text-sm mb-6">{t('All authorized personnel and key student leads.')}</p>
                    
                    <div className="space-y-4">
                        {directory.map((person, index) => (
                            <div key={index} className="dark:bg-gray-900 bg-gray-100 p-4 rounded-lg flex items-center space-x-4 border dark:border-gray-800 border-gray-300 transition duration-200 hover:border-green-500/50 dark:hover:shadow-xl hover:shadow-lg">
                                <UserAvatar 
                                    src={person.avatar || person.photo} 
                                    name={person.name} 
                                    size="w-12 h-12" 
                                    textStyle="text-base"
                                />
                                <div className="flex-grow">
                                    <p className="text-lg font-bold dark:text-white text-gray-900">{person.name}</p>
                                    <p className={`text-sm ${person.isStudent ? 'text-indigo-400' : 'text-green-400'}`}>
                                        {person.isStudent ? `${t('Student ID')}: ${person.id} (${t(person.major)})` : t(person.role)}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-mono rounded-full ${person.isStudent ? 'bg-indigo-800/50 text-indigo-300' : 'bg-green-800/50 text-green-300'}`}>
                                    {person.isStudent ? t('Student') : t('Faculty')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Placeholder for Account/Profile View
    const ProfileView = () => {
        if (!isProfileValidated) return <LoginView requiredPage={t('User Profile')} />;
        
        const [photoFile, setPhotoFile] = useState(null);
        const [updateName, setUpdateName] = useState(profileData.name || '');
        const [isUpdating, setIsUpdating] = useState(false);

        useEffect(() => {
             // Update local state when profileData changes (e.g., after initial fetch)
             setUpdateName(profileData.name || '');
        }, [profileData]);


        const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (file && file.size > 1024 * 1024 * 5) { // 5MB limit
                displayError("File size exceeds 5MB limit.");
                setPhotoFile(null);
                return;
            }
            setPhotoFile(file);
        };

        const handleUpdateProfile = async (e) => {
            e.preventDefault();
            if (!dbInstance || !user) return;
            setIsUpdating(true);
            const userId = user.uid; 
            
            const profilePath = `artifacts/${appId}/users/${userId}/user_profile/doc`;
            const profileRef = doc(dbInstance, profilePath);
            let newPhotoURL = profileData.photoURL;

            try {
                // Photo upload is simulated here as we cannot handle actual file uploads/storage
                if (photoFile) {
                    const initials = updateName.split(' ').map(n => n[0]).join('').substring(0, 2) || 'AN';
                    newPhotoURL = `https://placehold.co/100x100/4F46E5/FFFFFF?text=${initials}`;
                }
                
                const updateData = {
                    name: updateName,
                    photoURL: newPhotoURL,
                };
                
                await withRetry(setDoc)(profileRef, updateData, { merge: true });
                setProfileData(prev => ({ ...prev, ...updateData }));
                displayError("Profile updated successfully!", "success");
                setPhotoFile(null); 
                
            } catch (error) {
                console.error("Profile update failed:", error);
                displayError("Failed to update profile. Try logging in again.");
            } finally {
                setIsUpdating(false);
            }
        };

        return (
            <div className="max-w-2xl mx-auto p-4 mt-4">
                <div className="dark:bg-gray-800 bg-white p-8 rounded-xl border dark:border-orange-700/50 border-orange-200/50 shadow-2xl transition-colors duration-300">
                    <h2 className="text-3xl font-bold text-orange-400 flex items-center mb-6 border-b dark:border-gray-700 border-gray-300 pb-3">
                        <Settings className="w-6 h-6 mr-3 text-orange-400" /> {t('User Profile')} {t('Settings')}
                    </h2>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <UserAvatar 
                                src={photoFile ? URL.createObjectURL(photoFile) : profileData.photoURL || user?.photoURL} 
                                name={updateName} 
                                size="w-24 h-24" 
                                textStyle="text-2xl"
                            />
                            <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-500 transition duration-200 shadow-md">
                                <Image className="w-4 h-4 inline-block mr-2" />
                                {t('Change Photo')}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                            {photoFile && <p className="text-sm dark:text-gray-400 text-gray-500">{photoFile.name} {t('ready to upload.')}</p>}
                        </div>

                        {/* System ID Match */}
                        <div className="dark:bg-gray-700/50 bg-gray-100 p-3 rounded-lg border dark:border-gray-600 border-gray-300">
                            <label className="block text-sm font-medium dark:text-gray-400 text-gray-600 mb-1">{t('System ID Match')}</label>
                            <p className="font-mono dark:text-white text-gray-900 break-all">{profileData.student_id || t('Unvalidated')}</p>
                        </div>
                        
                        {/* User ID */}
                        <div className="dark:bg-gray-700/50 bg-gray-100 p-3 rounded-lg border dark:border-gray-600 border-gray-300">
                            <label className="block text-sm font-medium dark:text-gray-400 text-gray-600 mb-1">{t('System User ID')}</label>
                            <p className="font-mono dark:text-white text-gray-900 break-all">{userId}</p>
                        </div>

                        {/* Display Name */}
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium dark:text-gray-400 text-gray-600 mb-2">{t('Display Name')}</label>
                            <input
                                id="displayName"
                                type="text"
                                value={updateName}
                                onChange={(e) => setUpdateName(e.target.value)}
                                className="w-full p-3 dark:bg-gray-700 bg-gray-100 dark:text-white text-gray-900 border dark:border-gray-600 border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-500 transition duration-300 shadow-xl flex items-center justify-center disabled:bg-gray-600"
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                                    {t('Updating Profile...')}
                                </>
                            ) : (
                                t('Save Changes')
                            )}
                        </button>
                        
                        {/* Sign Out (Alternative) */}
                        <button type="button" onClick={handleSignOut} className="w-full py-2 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-600 transition duration-300 shadow-md flex items-center justify-center">
                            <LogOut className="w-4 h-4 mr-2" /> {t('Sign Out of Platform')}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    // --- Main Render Function ---
    const renderPage = () => {
        if (!isAuthReady) {
            return (
                <div className="min-h-[calc(100vh-64px)] flex items-center justify-center dark:bg-gray-900 bg-gray-100 transition-colors duration-300">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <p className="ml-4 text-xl text-indigo-300">Initializing System...</p>
                </div>
            );
        }
        
        // If Firebase User exists but profile is NOT validated, force login view
        if (user && !isProfileValidated && currentPage !== 'login') {
             // Only allow navigation to 'portfolio', 'contact', or 'login' if unvalidated
             if (['chat', 'account'].includes(currentPage)) {
                 setCurrentPage('login');
             }
        }

        switch (currentPage) {
            case 'portfolio':
                return <PortfolioView />;
            case 'chat':
                return <ChatView />;
            case 'contact':
                return <DirectoryView />;
            case 'account':
                return <ProfileView />;
            case 'login':
                return <LoginView requiredPage={t('Authenticated Access')} />;
            default:
                return <PortfolioView />;
        }
    };

    return (
        <div className={`min-h-screen font-sans ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
            <style>{`
                /* Custom slow spin for the Aperture icon */
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
                
                /* Global transition for smoother theme changes */
                body, .transition-colors {
                    transition: background-color 0.3s, color 0.3s;
                }
            `}</style>
            <StatusAlert message={showError?.message} type={showError?.type} />
            <Header />
            <main>
                {renderPage()}
            </main>
        </div>
    );
};

export default App;