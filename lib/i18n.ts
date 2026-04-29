export type Lang = "en" | "th";

export const translations = {
  en: {
    // Header
    teamName: "Nora System",
    tagline: "AI Secretary · Developer Workspace",
    systemOnline: "System Online",
    statusOnline: "Online",

    // Nora Briefing
    noraBriefingLabel: "AI Secretary",
    noraBriefingTitle: "Ready to help you think, plan, and work better",
    noraBriefingRole: "Nora · Secretary",
    noraBriefingMessage:
      "I'm your thinking partner and workflow optimizer. I help you understand problems deeply, break down tasks, prioritize work, and prevent mistakes — so you can move faster and make better decisions.",
    briefingStat1Label: "active agents",
    briefingStat2Label: "done today",
    briefingStat3Label: "pending",

    // Stats
    activeAgents: "Active Agents",
    ofTotal: (n: number) => `of ${n} total`,
    completed: "Completed",
    tasksFinished: "tasks finished",
    standingBy: "Standing By",
    agentsIdle: "agents idle",
    systemHealth: "System Health",
    allServicesUp: "all services up",

    // Sections
    teamMembers: "Team",
    agents: "agents",
    requirements: "Requirements",
    teamFeedback: "Feedback",

    // Requirements Panel
    reqDone: (done: number, total: number) => `${done}/${total} done`,
    reqInProgress: (n: number) => `${n} in progress`,
    reqComplete: (pct: number) => `${pct}% complete`,
    addRequirement: "Add Requirement",
    newRequirement: "New Requirement",
    reqTitle: "Title",
    reqTitlePlaceholder: "What needs to be done?",
    reqDescription: "Description",
    reqDescPlaceholder: "Acceptance criteria or details",
    priority: "Priority",
    assignTo: "Assign to",
    cancel: "Cancel",
    add: "Add",
    noRequirements: "No requirements yet.",
    noRequirementsHint: "Add your first requirement to get started.",
    High: "High",
    Medium: "Medium",
    Low: "Low",
    Pending: "Pending",
    "In Progress": "In Progress",
    reqStatusDone: "Done",
    remove: "Remove",

    // Send to Nora
    sendToNora: "Send to Nora",
    briefModalTitle: "Requirement Brief",
    briefModalSubtitle: "Copy and paste this into your Cowork chat with Nora",
    copyBrief: "Copy Brief",
    briefCopied: "Copied!",
    closeBrief: "Close",
    noReqsToBrief: "Add at least one requirement before generating a brief.",

    // Project Context
    projectNamePlaceholder: "Project name (e.g. Booking System v2)",
    saveProject: "Save",

    // TaskBoard
    activeTasks: "Active Tasks",
    tasksPending: "pending",
    tasksInProgress: "in progress",
    tasksDone: "done",
    noActiveTasks: "No active tasks yet.",
    noActiveTasksHint: "Requirements marked as In Progress will appear here.",
    taskSize: "Size",

    // Feedback Panel
    achievements: (n: number) => `${n} achievements`,
    warnings: (n: number) => `${n} warnings`,
    addFeedback: "Add Feedback",
    newFeedback: "New Feedback",
    fromAgent: "From",
    type: "Type",
    message: "Message",
    messagePlaceholder: "What happened? What should be noted?",
    all: "All",
    noFeedback: "No feedback yet.",
    achievement: "Achievement",
    suggestion: "Suggestion",
    warning: "Warning",
    note: "Note",
    dismiss: "Dismiss",

    // Timestamps
    tsNow: "Just now",
  },
  th: {
    // Header
    teamName: "Nora System",
    tagline: "เลขา AI · พื้นที่ทำงานนักพัฒนา",
    systemOnline: "ระบบออนไลน์",
    statusOnline: "ออนไลน์",

    // Nora Briefing
    noraBriefingLabel: "เลขา AI",
    noraBriefingTitle: "พร้อมช่วยคุณคิด วางแผน และทำงานได้ดีขึ้น",
    noraBriefingRole: "Nora · เลขา",
    noraBriefingMessage:
      "ฉันคือหุ้นส่วนการคิดและผู้เพิ่มประสิทธิภาพงานของคุณ ช่วยให้คุณเข้าใจปัญหาได้ลึกขึ้น แยกย่อยงาน จัดลำดับความสำคัญ และป้องกันข้อผิดพลาด เพื่อให้ทำงานได้เร็วขึ้นและตัดสินใจได้ดีขึ้น",
    briefingStat1Label: "เอเจนต์ทำงาน",
    briefingStat2Label: "เสร็จวันนี้",
    briefingStat3Label: "รอดำเนินการ",

    // Stats
    activeAgents: "เอเจนต์ที่ทำงาน",
    ofTotal: (n: number) => `จากทั้งหมด ${n}`,
    completed: "เสร็จสิ้นแล้ว",
    tasksFinished: "งานที่เสร็จแล้ว",
    standingBy: "รอคำสั่ง",
    agentsIdle: "เอเจนต์ว่าง",
    systemHealth: "สถานะระบบ",
    allServicesUp: "บริการทุกอย่างปกติ",

    // Sections
    teamMembers: "ทีมงาน",
    agents: "เอเจนต์",
    requirements: "รายการงาน",
    teamFeedback: "ฟีดแบ็ก",

    // Requirements Panel
    reqDone: (done: number, total: number) => `${done}/${total} เสร็จแล้ว`,
    reqInProgress: (n: number) => `${n} กำลังดำเนินการ`,
    reqComplete: (pct: number) => `${pct}% สำเร็จ`,
    addRequirement: "เพิ่มรายการงาน",
    newRequirement: "รายการงานใหม่",
    reqTitle: "ชื่องาน",
    reqTitlePlaceholder: "ต้องทำอะไร?",
    reqDescription: "รายละเอียด",
    reqDescPlaceholder: "เงื่อนไขหรือรายละเอียดงาน",
    priority: "ความสำคัญ",
    assignTo: "มอบหมายให้",
    cancel: "ยกเลิก",
    add: "เพิ่ม",
    noRequirements: "ยังไม่มีรายการงาน",
    noRequirementsHint: "เพิ่มรายการแรกเพื่อเริ่มต้น",
    High: "สูง",
    Medium: "กลาง",
    Low: "ต่ำ",
    Pending: "รอดำเนินการ",
    "In Progress": "กำลังดำเนินการ",
    reqStatusDone: "เสร็จแล้ว",
    remove: "ลบ",

    // Send to Nora
    sendToNora: "ส่งให้ Nora",
    briefModalTitle: "Requirement Brief",
    briefModalSubtitle: "คัดลอกข้อความนี้แล้ววางใน Cowork chat กับ Nora",
    copyBrief: "คัดลอก Brief",
    briefCopied: "คัดลอกแล้ว!",
    closeBrief: "ปิด",
    noReqsToBrief: "เพิ่มรายการงานอย่างน้อย 1 รายการก่อนสร้าง brief",

    // Project Context
    projectNamePlaceholder: "ชื่อโปรเจกต์ (เช่น ระบบจองโต๊ะ v2)",
    saveProject: "บันทึก",

    // TaskBoard
    activeTasks: "งานที่กำลังทำ",
    tasksPending: "รอดำเนินการ",
    tasksInProgress: "กำลังดำเนินการ",
    tasksDone: "เสร็จแล้ว",
    noActiveTasks: "ยังไม่มีงานที่กำลังทำ",
    noActiveTasksHint: "รายการที่มีสถานะ In Progress จะแสดงที่นี่",
    taskSize: "ขนาด",

    // Feedback Panel
    achievements: (n: number) => `${n} ความสำเร็จ`,
    warnings: (n: number) => `${n} คำเตือน`,
    addFeedback: "เพิ่มฟีดแบ็ก",
    newFeedback: "ฟีดแบ็กใหม่",
    fromAgent: "จาก",
    type: "ประเภท",
    message: "ข้อความ",
    messagePlaceholder: "เกิดอะไรขึ้น? มีอะไรที่ควรบันทึกไว้?",
    all: "ทั้งหมด",
    noFeedback: "ยังไม่มีฟีดแบ็ก",
    achievement: "ความสำเร็จ",
    suggestion: "ข้อเสนอแนะ",
    warning: "คำเตือน",
    note: "บันทึก",
    dismiss: "ปิด",

    // Timestamps
    tsNow: "เมื่อกี้นี้",
  },
} as const;

export type Translations = (typeof translations)["en"];
