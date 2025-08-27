import { BookOpen, User as UserIcon, Users as UsersIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <UserIcon size={24} />,
    title: "Find Study Partners",
    description:
      "Match with students in your courses and subjects to find compatible study companions.",
  },
  {
    icon: <UsersIcon size={24} />,
    title: "Study Groups",
    description:
      "Create and join collaborative group study sessions with your peers.",
  },
  {
    icon: <BookOpen size={24} />,
    title: "Progress Tracking",
    description:
      "Monitor your study hours, track completed sessions, and visualize your learning progress.",
  },
];

export default features;

export const stats = [
  {
    title: "Study Hours",
    value: "24.5",
    change: "12",
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Study Partners",
    value: "8",
    change: "25",
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    title: "Active Groups",
    value: "3",
    change: null,
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
];

export const quickActions = [
  {
    title: "Find Study Partner",
    description: "Connect with students in your courses",
    href: "/partners",
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    title: "Create Study Group",
    description: "Start a new group session",
    href: "/groups/create",
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    ),
  },
  {
    title: "Schedule Session",
    description: "Plan your next study session",
    href: "/schedule",
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "View Progress",
    description: "Check your study analytics",
    href: "/progress",
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
];

export const recentActivities = [
  {
    icon: "👥",
    title: "Joined Mathematics Study Group",
    time: "2 hours ago",
    type: "group",
  },
  {
    icon: "🤝",
    title: "Connected with Sarah Johnson",
    time: "5 hours ago",
    type: "partner",
  },
  {
    icon: "📚",
    title: "Completed Physics Chapter 3",
    time: "1 day ago",
    type: "study",
  },
  {
    icon: "💬",
    title: "New message in Chemistry Group",
    time: "2 days ago",
    type: "group",
  },
];

export const menuItems = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard", active: true },
  { icon: "👥", label: "Find Partners", href: "/partners" },
  { icon: "📚", label: "Study Groups", href: "/study-groups" },
  // { icon: "📅", label: "Schedule", href: "/schedule" },
  { icon: "📊", label: "Progress", href: "/progress-tracker" },
  { icon: "💬", label: "Chat", href: "/chat" },
  { icon: "👤", label: "Profile", href: "/profile" },
  { icon: "⚙️", label: "Settings", href: "/settings" },
];
