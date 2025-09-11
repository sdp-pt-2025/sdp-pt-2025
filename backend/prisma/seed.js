import { PrismaClient } from "@prisma/client";
// import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// Sample data that matches your Prisma schema
const sampleData = {
    users: [
        {
            uid: "user1",
            email: "john.doe@students.wits.ac.za",
            displayName: "John Doe",
            photoURL: "https://via.placeholder.com/150",
            university: "University of the Witwatersrand",
            studentId: "12345678",
            yearOfStudy: 3,
            faculty: "Engineering and the Built Environment",
            modules: ["COMS3011", "COMS3028", "MATH101", "PHYS101"],
            fcmToken: "sample_fcm_token_1",
            isActive: true,
            lastLoginAt: new Date(),
            studyPreferences: {
                preferredStudyTimes: ["morning", "afternoon"],
                studyStyle: "group",
                locationPreference: "both",
                maxGroupSize: 6,
                subjects: ["Computer Science", "Mathematics", "Physics"]
            },
            availability: {
                monday: { start: "09:00", end: "17:00", available: true },
                tuesday: { start: "09:00", end: "17:00", available: true },
                wednesday: { start: "09:00", end: "17:00", available: true },
                thursday: { start: "09:00", end: "17:00", available: true },
                friday: { start: "09:00", end: "15:00", available: true },
                saturday: { start: "10:00", end: "16:00", available: true },
                sunday: { start: "10:00", end: "16:00", available: true }
            }
        },
        {
            uid: "user2",
            email: "jane.smith@students.wits.ac.za",
            displayName: "Jane Smith",
            photoURL: "https://via.placeholder.com/150",
            university: "University of the Witwatersrand",
            studentId: "87654321",
            yearOfStudy: 2,
            faculty: "Engineering and the Built Environment",
            modules: ["COMS3011", "MATH101", "STAT101"],
            fcmToken: "sample_fcm_token_2",
            isActive: true,
            lastLoginAt: new Date(),
            studyPreferences: {
                preferredStudyTimes: ["afternoon", "evening"],
                studyStyle: "individual",
                locationPreference: "indoor",
                maxGroupSize: 4,
                subjects: ["Computer Science", "Mathematics", "Statistics"]
            },
            availability: {
                monday: { start: "14:00", end: "20:00", available: true },
                tuesday: { start: "14:00", end: "20:00", available: true },
                wednesday: { start: "14:00", end: "20:00", available: true },
                thursday: { start: "14:00", end: "20:00", available: true },
                friday: { start: "14:00", end: "18:00", available: true },
                saturday: { start: "09:00", end: "15:00", available: true },
                sunday: { start: "09:00", end: "15:00", available: true }
            }
        },
        {
            uid: "user3",
            email: "mike.wilson@students.wits.ac.za",
            displayName: "Mike Wilson",
            photoURL: "https://via.placeholder.com/150",
            university: "University of the Witwatersrand",
            studentId: "11223344",
            yearOfStudy: 4,
            faculty: "Engineering and the Built Environment",
            modules: ["COMS3028", "COMS3011", "MATH201", "PHYS201"],
            fcmToken: "sample_fcm_token_3",
            isActive: true,
            lastLoginAt: new Date(),
            studyPreferences: {
                preferredStudyTimes: ["morning", "afternoon"],
                studyStyle: "both",
                locationPreference: "outdoor",
                maxGroupSize: 8,
                subjects: ["Computer Science", "Mathematics", "Physics"]
            },
            availability: {
                monday: { start: "08:00", end: "16:00", available: true },
                tuesday: { start: "08:00", end: "16:00", available: true },
                wednesday: { start: "08:00", end: "16:00", available: true },
                thursday: { start: "08:00", end: "16:00", available: true },
                friday: { start: "08:00", end: "14:00", available: true },
                saturday: { start: "10:00", end: "18:00", available: true },
                sunday: { start: "10:00", end: "18:00", available: true }
            }
        },
        {
            uid: "user4",
            email: "sarah.jones@students.wits.ac.za",
            displayName: "Sarah Jones",
            photoURL: "https://via.placeholder.com/150",
            university: "University of the Witwatersrand",
            studentId: "55667788",
            yearOfStudy: 1,
            faculty: "Science",
            modules: ["CHEM101", "BIOL101", "MATH101", "PHYS101"],
            fcmToken: "sample_fcm_token_4",
            isActive: true,
            lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            studyPreferences: {
                preferredStudyTimes: ["morning"],
                studyStyle: "group",
                locationPreference: "indoor",
                maxGroupSize: 5,
                subjects: ["Chemistry", "Biology", "Mathematics"]
            },
            availability: {
                monday: { start: "07:00", end: "14:00", available: true },
                tuesday: { start: "07:00", end: "14:00", available: true },
                wednesday: { start: "07:00", end: "14:00", available: true },
                thursday: { start: "07:00", end: "14:00", available: true },
                friday: { start: "07:00", end: "12:00", available: true },
                saturday: { start: "08:00", end: "14:00", available: false },
                sunday: { start: "08:00", end: "14:00", available: false }
            }
        },
        {
            uid: "user5",
            email: "alex.brown@students.wits.ac.za",
            displayName: "Alex Brown",
            photoURL: "https://via.placeholder.com/150",
            university: "University of the Witwatersrand",
            studentId: "99887766",
            yearOfStudy: 3,
            faculty: "Commerce, Law and Management",
            modules: ["ECON201", "ACCG201", "STAT201", "MATH201"],
            fcmToken: "sample_fcm_token_5",
            isActive: false,
            lastLoginAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            studyPreferences: {
                preferredStudyTimes: ["evening"],
                studyStyle: "individual",
                locationPreference: "both",
                maxGroupSize: 3,
                subjects: ["Economics", "Accounting", "Statistics"]
            },
            availability: {
                monday: { start: "18:00", end: "22:00", available: true },
                tuesday: { start: "18:00", end: "22:00", available: true },
                wednesday: { start: "18:00", end: "22:00", available: true },
                thursday: { start: "18:00", end: "22:00", available: true },
                friday: { start: "18:00", end: "22:00", available: true },
                saturday: { start: "10:00", end: "22:00", available: true },
                sunday: { start: "10:00", end: "22:00", available: true }
            }
        },
        {
            uid: "user6",
            email: "emma.davis@students.wits.ac.za",
            displayName: "Emma Davis",
            photoURL: "https://via.placeholder.com/150",
            university: "University of the Witwatersrand",
            studentId: "44556677",
            yearOfStudy: 2,
            faculty: "Health Sciences",
            modules: ["ANAT201", "PHYS201", "CHEM201", "BIOL201"],
            fcmToken: "sample_fcm_token_6",
            isActive: true,
            lastLoginAt: new Date(Date.now() - 30 * 60 * 1000),
            studyPreferences: {
                preferredStudyTimes: ["morning", "afternoon"],
                studyStyle: "group",
                locationPreference: "indoor",
                maxGroupSize: 6,
                subjects: ["Anatomy", "Physiology", "Chemistry", "Biology"]
            },
            availability: {
                monday: { start: "08:00", end: "18:00", available: true },
                tuesday: { start: "08:00", end: "18:00", available: true },
                wednesday: { start: "08:00", end: "18:00", available: true },
                thursday: { start: "08:00", end: "18:00", available: true },
                friday: { start: "08:00", end: "16:00", available: true },
                saturday: { start: "09:00", end: "15:00", available: true },
                sunday: { start: "09:00", end: "15:00", available: true }
            }
        },
        {
            uid: "user7",
            email: "tom.garcia@students.wits.ac.za",
            displayName: "Tom Garcia",
            photoURL: "https://via.placeholder.com/150",
            university: "University of the Witwatersrand",
            studentId: "33445566",
            yearOfStudy: 4,
            faculty: "Humanities",
            modules: ["PSYC301", "PHIL301", "ENGL301", "HIST301"],
            fcmToken: "sample_fcm_token_7",
            isActive: true,
            lastLoginAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            studyPreferences: {
                preferredStudyTimes: ["afternoon", "evening"],
                studyStyle: "both",
                locationPreference: "outdoor",
                maxGroupSize: 4,
                subjects: ["Psychology", "Philosophy", "English", "History"]
            },
            availability: {
                monday: { start: "12:00", end: "20:00", available: true },
                tuesday: { start: "12:00", end: "20:00", available: true },
                wednesday: { start: "12:00", end: "20:00", available: true },
                thursday: { start: "12:00", end: "20:00", available: true },
                friday: { start: "12:00", end: "18:00", available: true },
                saturday: { start: "10:00", end: "16:00", available: true },
                sunday: { start: "10:00", end: "16:00", available: true }
            }
        },
        {
            uid: "user8",
            email: "lucy.martinez@students.wits.ac.za",
            displayName: "Lucy Martinez",
            photoURL: "https://via.placeholder.com/150",
            university: "University of the Witwatersrand",
            studentId: "22334455",
            yearOfStudy: 1,
            faculty: "Engineering and the Built Environment",
            modules: ["MECH101", "MATH101", "PHYS101", "CHEM101"],
            fcmToken: "sample_fcm_token_8",
            isActive: true,
            lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            studyPreferences: {
                preferredStudyTimes: ["morning"],
                studyStyle: "group",
                locationPreference: "indoor",
                maxGroupSize: 5,
                subjects: ["Mechanical Engineering", "Mathematics", "Physics"]
            },
            availability: {
                monday: { start: "07:00", end: "15:00", available: true },
                tuesday: { start: "07:00", end: "15:00", available: true },
                wednesday: { start: "07:00", end: "15:00", available: true },
                thursday: { start: "07:00", end: "15:00", available: true },
                friday: { start: "07:00", end: "13:00", available: true },
                saturday: { start: "08:00", end: "14:00", available: true },
                sunday: { start: "08:00", end: "14:00", available: false }
            }
        },
        {
            uid: "user9",
            email: "david.lee@students.wits.ac.za",
            displayName: "David Lee",
            photoURL: "https://via.placeholder.com/150",
            university: "University of the Witwatersrand",
            studentId: "11223355",
            yearOfStudy: 3,
            faculty: "Science",
            modules: ["COMP301", "MATH301", "STAT301", "PHYS301"],
            fcmToken: "sample_fcm_token_9",
            isActive: true,
            lastLoginAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            studyPreferences: {
                preferredStudyTimes: ["evening"],
                studyStyle: "individual",
                locationPreference: "both",
                maxGroupSize: 3,
                subjects: ["Computer Science", "Mathematics", "Statistics"]
            },
            availability: {
                monday: { start: "16:00", end: "22:00", available: true },
                tuesday: { start: "16:00", end: "22:00", available: true },
                wednesday: { start: "16:00", end: "22:00", available: true },
                thursday: { start: "16:00", end: "22:00", available: true },
                friday: { start: "16:00", end: "22:00", available: true },
                saturday: { start: "10:00", end: "22:00", available: true },
                sunday: { start: "10:00", end: "22:00", available: true }
            }
        },
        {
            uid: "user10",
            email: "sophie.taylor@students.wits.ac.za",
            displayName: "Sophie Taylor",
            photoURL: "https://via.placeholder.com/150",
            university: "University of the Witwatersrand",
            studentId: "66778899",
            yearOfStudy: 2,
            faculty: "Commerce, Law and Management",
            modules: ["LAWS201", "POLS201", "HIST201", "ENGL201"],
            fcmToken: "sample_fcm_token_10",
            isActive: true,
            lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            studyPreferences: {
                preferredStudyTimes: ["afternoon"],
                studyStyle: "group",
                locationPreference: "indoor",
                maxGroupSize: 7,
                subjects: ["Law", "Politics", "History", "English"]
            },
            availability: {
                monday: { start: "13:00", end: "19:00", available: true },
                tuesday: { start: "13:00", end: "19:00", available: true },
                wednesday: { start: "13:00", end: "19:00", available: true },
                thursday: { start: "13:00", end: "19:00", available: true },
                friday: { start: "13:00", end: "17:00", available: true },
                saturday: { start: "09:00", end: "17:00", available: true },
                sunday: { start: "09:00", end: "17:00", available: true }
            }
        }
    ],

    studyGroups: [
        {
            id: "group1",
            name: "COMS3011 Algorithms Study Group",
            description: "Weekly study group for COMS3011 Algorithms course. We focus on problem-solving and exam preparation.",
            module: "COMS3011",
            topic: "Algorithms and Data Structures",
            createdBy: "user1",
            createdByName: "John Doe",
            memberCount: 5,
            maxMembers: 6,
            isPublic: true,
            tags: ["algorithms", "data-structures", "exam-prep"],
            status: "active",
            lastActivityAt: new Date(),
            location: {
                type: "campus",
                details: "Library Study Room 3A",
                coordinates: { lat: -26.1929, lng: 28.0305 }
            },
            schedule: {
                frequency: "weekly",
                dayOfWeek: "tuesday",
                time: "14:00",
                duration: 120,
                nextSession: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        },
        {
            id: "group2",
            name: "MATH101 Calculus Study Group",
            description: "Study group for MATH101 Calculus. We meet twice a week to work through problems and prepare for tests.",
            module: "MATH101",
            topic: "Calculus",
            createdBy: "user2",
            createdByName: "Jane Smith",
            memberCount: 4,
            maxMembers: 5,
            isPublic: true,
            tags: ["calculus", "mathematics", "problem-solving"],
            status: "active",
            lastActivityAt: new Date(),
            location: {
                type: "online",
                details: "Microsoft Teams Meeting"
            },
            schedule: {
                frequency: "weekly",
                dayOfWeek: "wednesday",
                time: "16:00",
                duration: 90,
                nextSession: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            }
        },
        {
            id: "group3",
            name: "Chemistry Lab Preparation",
            description: "Preparation sessions for CHEM101 laboratory experiments and theoretical concepts.",
            module: "CHEM101",
            topic: "General Chemistry",
            createdBy: "user4",
            createdByName: "Sarah Jones",
            memberCount: 3,
            maxMembers: 6,
            isPublic: true,
            tags: ["chemistry", "laboratory", "experiments"],
            status: "active",
            lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            location: {
                type: "campus",
                details: "Chemistry Building Lab 2B",
                coordinates: { lat: -26.1935, lng: 28.0295 }
            },
            schedule: {
                frequency: "weekly",
                dayOfWeek: "friday",
                time: "10:00",
                duration: 180,
                nextSession: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
            }
        },
        {
            id: "group4",
            name: "Economics Discussion Forum",
            description: "Weekly discussions on ECON201 topics, current economic events, and exam preparation.",
            module: "ECON201",
            topic: "Microeconomics",
            createdBy: "user5",
            createdByName: "Alex Brown",
            memberCount: 2,
            maxMembers: 8,
            isPublic: true,
            tags: ["economics", "microeconomics", "discussion"],
            status: "inactive",
            lastActivityAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            location: {
                type: "hybrid",
                details: "Commerce Building Room 301 / Zoom",
                coordinates: { lat: -26.1920, lng: 28.0310 }
            },
            schedule: {
                frequency: "weekly",
                dayOfWeek: "monday",
                time: "18:30",
                duration: 90,
                nextSession: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
            }
        },
        {
            id: "group5",
            name: "Anatomy Study Circle",
            description: "Interactive study sessions for ANAT201 with anatomical models and group discussions.",
            module: "ANAT201",
            topic: "Human Anatomy",
            createdBy: "user6",
            createdByName: "Emma Davis",
            memberCount: 6,
            maxMembers: 8,
            isPublic: true,
            tags: ["anatomy", "medicine", "models"],
            status: "active",
            lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            location: {
                type: "campus",
                details: "Health Sciences Building Anatomy Lab",
                coordinates: { lat: -26.1940, lng: 28.0300 }
            },
            schedule: {
                frequency: "biweekly",
                dayOfWeek: "thursday",
                time: "15:00",
                duration: 150,
                nextSession: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            }
        },
        {
            id: "group6",
            name: "Psychology Research Group",
            description: "Collaborative research discussions and study sessions for PSYC301 advanced topics.",
            module: "PSYC301",
            topic: "Cognitive Psychology",
            createdBy: "user7",
            createdByName: "Tom Garcia",
            memberCount: 4,
            maxMembers: 6,
            isPublic: false,
            tags: ["psychology", "research", "cognitive"],
            status: "active",
            lastActivityAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            location: {
                type: "campus",
                details: "Humanities Building Room 204",
                coordinates: { lat: -26.1925, lng: 28.0315 }
            },
            schedule: {
                frequency: "weekly",
                dayOfWeek: "wednesday",
                time: "14:00",
                duration: 120,
                nextSession: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            }
        },
        {
            id: "group7",
            name: "Mechanical Engineering Fundamentals",
            description: "Basic concepts and problem-solving for first-year mechanical engineering students.",
            module: "MECH101",
            topic: "Engineering Mechanics",
            createdBy: "user8",
            createdByName: "Lucy Martinez",
            memberCount: 7,
            maxMembers: 10,
            isPublic: true,
            tags: ["mechanical", "engineering", "fundamentals"],
            status: "active",
            lastActivityAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            location: {
                type: "campus",
                details: "Engineering Building Workshop A",
                coordinates: { lat: -26.1930, lng: 28.0290 }
            },
            schedule: {
                frequency: "weekly",
                dayOfWeek: "saturday",
                time: "09:00",
                duration: 180,
                nextSession: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            }
        },
        {
            id: "group8",
            name: "Statistics and Data Analysis",
            description: "Advanced statistical methods and data analysis techniques for STAT301.",
            module: "STAT301",
            topic: "Statistical Analysis",
            createdBy: "user9",
            createdByName: "David Lee",
            memberCount: 3,
            maxMembers: 5,
            isPublic: true,
            tags: ["statistics", "data-analysis", "advanced"],
            status: "active",
            lastActivityAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
            location: {
                type: "online",
                details: "Google Meet"
            },
            schedule: {
                frequency: "weekly",
                dayOfWeek: "sunday",
                time: "19:00",
                duration: 120,
                nextSession: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
            }
        },
        {
            id: "group9",
            name: "Constitutional Law Study Group",
            description: "In-depth analysis of constitutional law cases and principles for LAWS201.",
            module: "LAWS201",
            topic: "Constitutional Law",
            createdBy: "user10",
            createdByName: "Sophie Taylor",
            memberCount: 5,
            maxMembers: 8,
            isPublic: true,
            tags: ["law", "constitutional", "cases"],
            status: "active",
            lastActivityAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            location: {
                type: "campus",
                details: "Law Building Moot Court",
                coordinates: { lat: -26.1918, lng: 28.0318 }
            },
            schedule: {
                frequency: "weekly",
                dayOfWeek: "friday",
                time: "16:00",
                duration: 120,
                nextSession: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
            }
        },
        {
            id: "group10",
            name: "Physics Problem Solvers",
            description: "Collaborative problem-solving sessions for various physics modules.",
            module: "PHYS201",
            topic: "Classical Mechanics",
            createdBy: "user3",
            createdByName: "Mike Wilson",
            memberCount: 4,
            maxMembers: 7,
            isPublic: true,
            tags: ["physics", "mechanics", "problems"],
            status: "active",
            lastActivityAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            location: {
                type: "campus",
                details: "Physics Building Tutorial Room 1",
                coordinates: { lat: -26.1932, lng: 28.0308 }
            },
            schedule: {
                frequency: "weekly",
                dayOfWeek: "thursday",
                time: "13:00",
                duration: 90,
                nextSession: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            }
        }
    ],

    groupMembers: [
        // Group 1 members
        { userId: "user1", groupId: "group1" },
        { userId: "user2", groupId: "group1" },
        { userId: "user3", groupId: "group1" },
        { userId: "user8", groupId: "group1" },
        { userId: "user9", groupId: "group1" },
        
        // Group 2 members
        { userId: "user2", groupId: "group2" },
        { userId: "user1", groupId: "group2" },
        { userId: "user4", groupId: "group2" },
        { userId: "user8", groupId: "group2" },
        
        // Group 3 members
        { userId: "user4", groupId: "group3" },
        { userId: "user6", groupId: "group3" },
        { userId: "user8", groupId: "group3" },
        
        // Group 4 members
        { userId: "user5", groupId: "group4" },
        { userId: "user10", groupId: "group4" },
        
        // Group 5 members
        { userId: "user6", groupId: "group5" },
        { userId: "user4", groupId: "group5" },
        { userId: "user1", groupId: "group5" },
        { userId: "user2", groupId: "group5" },
        { userId: "user3", groupId: "group5" },
        { userId: "user8", groupId: "group5" },
        
        // Group 6 members
        { userId: "user7", groupId: "group6" },
        { userId: "user10", groupId: "group6" },
        { userId: "user5", groupId: "group6" },
        { userId: "user9", groupId: "group6" },
        
        // Group 7 members
        { userId: "user8", groupId: "group7" },
        { userId: "user1", groupId: "group7" },
        { userId: "user2", groupId: "group7" },
        { userId: "user3", groupId: "group7" },
        { userId: "user4", groupId: "group7" },
        { userId: "user6", groupId: "group7" },
        { userId: "user9", groupId: "group7" },
        
        // Group 8 members
        { userId: "user9", groupId: "group8" },
        { userId: "user2", groupId: "group8" },
        { userId: "user5", groupId: "group8" },
        
        // Group 9 members
        { userId: "user10", groupId: "group9" },
        { userId: "user7", groupId: "group9" },
        { userId: "user5", groupId: "group9" },
        { userId: "user1", groupId: "group9" },
        { userId: "user6", groupId: "group9" },
        
        // Group 10 members
        { userId: "user3", groupId: "group10" },
        { userId: "user1", groupId: "group10" },
        { userId: "user4", groupId: "group10" },
        { userId: "user6", groupId: "group10" }
    ],

    groupMessages: [
        {
            id: "msg1",
            groupId: "group1",
            senderId: "user1",
            senderName: "John Doe",
            message: "Hey everyone! Looking forward to our study session tomorrow. I've prepared some practice problems on sorting algorithms.",
            messageType: "text",
            attachments: [],
            replyTo: null,
            edited: false,
            editedAt: null,
            reactions: {
                "👍": ["user2", "user3"],
                "🔥": ["user2"]
            }
        },
        {
            id: "msg2",
            groupId: "group1",
            senderId: "user2",
            senderName: "Jane Smith",
            message: "Great! I've been working on the merge sort implementation. Can we go through it together?",
            messageType: "text",
            attachments: [],
            replyTo: "msg1",
            edited: false,
            editedAt: null,
            reactions: {}
        }
    ],

    studySessions: [
        {
            id: "session1",
            userId: "user1",
            groupId: "group1",
            module: "COMS3011",
            topic: "Sorting Algorithms",
            sessionType: "group",
            duration: 120,
            startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
            completed: true,
            rating: 5,
            notes: "Great session! Everyone understood the merge sort implementation. Need to focus more on quick sort next time.",
            location: {
                type: "campus",
                details: "Library Study Room 3A"
            },
            activities: [
                {
                    activity: "problem_solving",
                    duration: 60,
                    description: "Worked through sorting algorithm problems"
                },
                {
                    activity: "discussion",
                    duration: 40,
                    description: "Discussed time complexity analysis"
                },
                {
                    activity: "review",
                    duration: 20,
                    description: "Reviewed key concepts"
                }
            ]
        },
        {
            id: "session2",
            userId: "user2",
            groupId: null,
            module: "MATH101",
            topic: "Derivatives",
            sessionType: "individual",
            duration: 90,
            startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
            completed: true,
            rating: 4,
            notes: "Made good progress on understanding the chain rule. Need to practice more with trigonometric functions.",
            location: {
                type: "home",
                details: "Home study room"
            },
            activities: [
                {
                    activity: "reading",
                    duration: 30,
                    description: "Read textbook chapter on derivatives"
                },
                {
                    activity: "problem_solving",
                    duration: 45,
                    description: "Solved practice problems"
                },
                {
                    activity: "note_taking",
                    duration: 15,
                    description: "Created summary notes"
                }
            ]
        }
    ],

    studySessionParticipants: [
        { sessionId: "session1", userId: "user1" },
        { sessionId: "session1", userId: "user2" },
        { sessionId: "session1", userId: "user3" }
    ],

    progressTracking: [
        {
            id: "progress1",
            userId: "user1",
            module: "COMS3011",
            topic: "Sorting Algorithms",
            status: "completed",
            completionPercentage: 100,
            studyHours: 8.5,
            lastStudied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            difficulty: 3,
            confidence: 4,
            notes: "Mastered bubble sort, selection sort, and merge sort. Quick sort still needs work.",
            resources: [
                {
                    type: "textbook",
                    title: "Introduction to Algorithms",
                    url: "https://example.com/textbook",
                    completed: true
                },
                {
                    type: "video",
                    title: "Sorting Algorithms Explained",
                    url: "https://example.com/video",
                    completed: true
                },
                {
                    type: "practice_problems",
                    title: "LeetCode Sorting Problems",
                    url: "https://leetcode.com/problemset/all/",
                    completed: false
                }
            ],
            milestones: [
                {
                    title: "Understand Basic Sorting",
                    description: "Learn bubble sort and selection sort",
                    completed: true,
                    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                },
                {
                    title: "Master Merge Sort",
                    description: "Implement and understand merge sort",
                    completed: true,
                    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                },
                {
                    title: "Quick Sort Implementation",
                    description: "Implement and understand quick sort",
                    completed: false,
                    completedAt: null
                }
            ]
        }
    ],

    notifications: [
        {
            id: "notif1",
            userId: "user1",
            senderId: "system",
            senderName: "System",
            title: "Study Session Reminder",
            body: "Your COMS3011 study group session starts in 30 minutes!",
            type: "session_reminder",
            data: {
                groupId: "group1",
                sessionTime: "14:00"
            },
            read: false,
            readAt: null,
            fcmMessageId: "fcm_msg_1"
        },
        {
            id: "notif2",
            userId: "user2",
            senderId: "user1",
            senderName: "John Doe",
            title: "New Group Invitation",
            body: "You have been invited to join the MATH101 Study Group",
            type: "group_invite",
            data: {
                groupId: "group2",
                groupName: "MATH101 Study Group"
            },
            read: true,
            readAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            fcmMessageId: "fcm_msg_2"
        }
    ],

    courseworkFiles: [
        {
            id: "file1",
            fileName: "COMS3011_Assignment1.pdf",
            storagePath: "coursework/user1/assignment1.pdf",
            downloadUrl: "https://storage.googleapis.com/sd2025law.appspot.com/coursework/user1/assignment1.pdf",
            uploadedBy: "user1",
            fileSize: 2048576,
            mimeType: "application/pdf",
            isPublic: false,
            tags: ["assignment", "algorithms"],
            description: "First assignment for COMS3011 - Sorting Algorithms",
            courseCode: "COMS3011",
            topic: "Sorting Algorithms",
            downloadCount: 3,
            lastDownloadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
    ],

    bugs: [
        {
            id: "bug1",
            title: "Weather widget not updating in real-time",
            description: "The weather widget on the dashboard shows cached data and doesn't refresh automatically. Users have to manually refresh the page to see updated weather information.",
            severity: "medium",
            category: "ui",
            status: "open",
            priority: 5,
            reporterId: "user1",
            reporterName: "John Doe",
            reporterEmail: "john.doe@students.wits.ac.za",
            assignedTo: null,
            assignedToName: null,
            stepsToReproduce: "1. Open the dashboard\n2. Wait for 5+ minutes\n3. Check if weather data updates\n4. Notice it still shows old data",
            expectedBehavior: "Weather data should update automatically every 5 minutes",
            actualBehavior: "Weather data remains static until page refresh",
            attachments: [],
            tags: ["weather", "dashboard", "real-time"],
            votes: 2,
            voters: ["user1", "user2"],
            watchers: ["user1", "user2", "user3"],
            resolvedAt: null,
            environment: {
                browser: "Chrome 120",
                os: "Windows 11",
                device: "Desktop",
                version: "1.0.0",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            comments: []
        }
    ]
};

async function main() {
    console.log("🌱 Starting Prisma seeding...");

    try {
    // Clear existing data
        console.log("🧹 Clearing existing data...");
        const tables = [
            "bugs",
            "coursework_files",
            "notifications",
            "progress_tracking",
            "study_session_participants",
            "study_sessions",
            "group_messages",
            "group_members",
            "study_groups",
            "users"
        ];

        for (const table of tables) {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
        }

        // Seed users
        console.log("👥 Seeding users...");
        for (const user of sampleData.users) {
            await prisma.user.create({
                data: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    university: user.university,
                    studentId: user.studentId,
                    yearOfStudy: user.yearOfStudy,
                    faculty: user.faculty,
                    modules: user.modules,
                    fcmToken: user.fcmToken,
                    isActive: user.isActive,
                    lastLoginAt: user.lastLoginAt,
                    studyPreferences: user.studyPreferences,
                    availability: user.availability
                }
            });
        }

        // Seed study groups
        console.log("👥 Seeding study groups...");
        for (const group of sampleData.studyGroups) {
            await prisma.studyGroup.create({
                data: {
                    id: group.id,
                    name: group.name,
                    description: group.description,
                    module: group.module,
                    topic: group.topic,
                    createdBy: group.createdBy,
                    createdByName: group.createdByName,
                    memberCount: group.memberCount,
                    maxMembers: group.maxMembers,
                    isPublic: group.isPublic,
                    tags: group.tags,
                    status: group.status,
                    lastActivityAt: group.lastActivityAt,
                    location: group.location,
                    schedule: group.schedule
                }
            });
        }

        // Seed group members
        console.log("👥 Seeding group members...");
        for (const member of sampleData.groupMembers) {
            await prisma.groupMember.create({
                data: {
                    userId: member.userId,
                    groupId: member.groupId
                }
            });
        }

        // Seed group messages
        console.log("💬 Seeding group messages...");
        for (const msg of sampleData.groupMessages) {
            await prisma.groupMessage.create({
                data: {
                    id: msg.id,
                    groupId: msg.groupId,
                    senderId: msg.senderId,
                    senderName: msg.senderName,
                    message: msg.message,
                    messageType: msg.messageType,
                    attachments: msg.attachments,
                    replyTo: msg.replyTo,
                    edited: msg.edited,
                    editedAt: msg.editedAt,
                    reactions: msg.reactions
                }
            });
        }

        // Seed study sessions
        console.log("📚 Seeding study sessions...");
        for (const session of sampleData.studySessions) {
            await prisma.studySession.create({
                data: {
                    id: session.id,
                    userId: session.userId,
                    groupId: session.groupId,
                    module: session.module,
                    topic: session.topic,
                    sessionType: session.sessionType,
                    duration: session.duration,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    completed: session.completed,
                    rating: session.rating,
                    notes: session.notes,
                    location: session.location,
                    activities: session.activities
                }
            });
        }

        // Seed study session participants
        console.log("👥 Seeding study session participants...");
        for (const participant of sampleData.studySessionParticipants) {
            await prisma.studySessionParticipant.create({
                data: {
                    sessionId: participant.sessionId,
                    userId: participant.userId
                }
            });
        }

        // Seed progress tracking
        console.log("📊 Seeding progress tracking...");
        for (const progress of sampleData.progressTracking) {
            await prisma.progressTracking.create({
                data: {
                    id: progress.id,
                    userId: progress.userId,
                    module: progress.module,
                    topic: progress.topic,
                    status: progress.status,
                    completionPercentage: progress.completionPercentage,
                    studyHours: progress.studyHours,
                    lastStudied: progress.lastStudied,
                    difficulty: progress.difficulty,
                    confidence: progress.confidence,
                    notes: progress.notes,
                    resources: progress.resources,
                    milestones: progress.milestones
                }
            });
        }

        // Seed notifications
        console.log("🔔 Seeding notifications...");
        for (const notification of sampleData.notifications) {
            await prisma.notification.create({
                data: {
                    id: notification.id,
                    userId: notification.userId,
                    senderId: notification.senderId,
                    senderName: notification.senderName,
                    title: notification.title,
                    body: notification.body,
                    type: notification.type,
                    data: notification.data,
                    read: notification.read,
                    readAt: notification.readAt,
                    fcmMessageId: notification.fcmMessageId
                }
            });
        }

        // Seed coursework files
        console.log("📁 Seeding coursework files...");
        for (const file of sampleData.courseworkFiles) {
            await prisma.courseworkFile.create({
                data: {
                    id: file.id,
                    fileName: file.fileName,
                    storagePath: file.storagePath,
                    downloadUrl: file.downloadUrl,
                    uploadedBy: file.uploadedBy,
                    fileSize: file.fileSize,
                    mimeType: file.mimeType,
                    isPublic: file.isPublic,
                    tags: file.tags,
                    description: file.description,
                    courseCode: file.courseCode,
                    topic: file.topic,
                    downloadCount: file.downloadCount,
                    lastDownloadedAt: file.lastDownloadedAt
                }
            });
        }

        // Seed bugs
        console.log("🐛 Seeding bugs...");
        for (const bug of sampleData.bugs) {
            await prisma.bug.create({
                data: {
                    id: bug.id,
                    title: bug.title,
                    description: bug.description,
                    severity: bug.severity,
                    category: bug.category,
                    status: bug.status,
                    priority: bug.priority,
                    reporterId: bug.reporterId,
                    reporterName: bug.reporterName,
                    reporterEmail: bug.reporterEmail,
                    assignedTo: bug.assignedTo,
                    assignedToName: bug.assignedToName,
                    stepsToReproduce: bug.stepsToReproduce,
                    expectedBehavior: bug.expectedBehavior,
                    actualBehavior: bug.actualBehavior,
                    attachments: bug.attachments,
                    tags: bug.tags,
                    votes: bug.votes,
                    voters: bug.voters,
                    watchers: bug.watchers,
                    resolvedAt: bug.resolvedAt,
                    environment: bug.environment,
                    comments: bug.comments
                }
            });
        }

        console.log("✅ Seeding complete!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });