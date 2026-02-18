"use client";

import { Email, ActiveFolder } from "@/types";

interface FocusModeProps {
  todaysTasks: Email[];
  getPriorityScore: (mail: Email) => number;
  getPriorityColor: (score: number) => string;
  extractDeadline: (text: string, mailId?: string) => string | null;
  openMailAndGenerateAI: (id: string, mail: Email) => void;
  markDone: () => void;
  selectedMail: Email | null;
  getEmailCategory: (mail: Email) => string;
  getCategoryColor: (category: string) => string;
  aiTodoTitles: Record<string, string>;
  getSimpleTodoTitle: (mail: Email) => string;
  generateAITodoTitle: (mail: Email) => void;
  setShowFocusMode: (show: boolean) => void;
  setActiveFolder: (folder: ActiveFolder) => void;
}

export default function FocusMode({
  todaysTasks,
  getPriorityScore,
  getPriorityColor,
  extractDeadline,
  openMailAndGenerateAI,
  markDone,
  selectedMail,
  getEmailCategory,
  getCategoryColor,
  aiTodoTitles,
  getSimpleTodoTitle,
  generateAITodoTitle,
  setShowFocusMode,
  setActiveFolder,
}: FocusModeProps) {
  const now = new Date();
  const timeOfDay = now.getHours() < 12 ? "Morning" : now.getHours() < 17 ? "Afternoon" : "Evening";
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        background: "#F8FAFF",
        padding: "32px 48px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 700,
            background: "linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
          }}
        >
          🎯 Focus Mode
        </h1>
        <p style={{ fontSize: 18, color: "#6B7280", marginBottom: 4 }}>
          Good {timeOfDay}! Here are your urgent tasks for today
        </p>
        <p style={{ fontSize: 16, color: "#9CA3AF" }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Task Count Banner */}
      <div
        style={{
          background: todaysTasks.length === 0 
            ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
            : todaysTasks.length <= 3
            ? "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)"
            : "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
          borderRadius: 20,
          padding: 32,
          color: "white",
          textAlign: "center",
          marginBottom: 32,
          boxShadow: "0 8px 24px rgba(239, 68, 68, 0.25)",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 12 }}>
          {todaysTasks.length}
        </div>
        <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.95 }}>
          {todaysTasks.length === 0 
            ? "🎉 No urgent tasks today!"
            : todaysTasks.length === 1
            ? "Urgent Task Today"
            : "Urgent Tasks Today"}
        </div>
        {todaysTasks.length > 0 && (
          <div style={{ fontSize: 16, opacity: 0.9, marginTop: 8 }}>
            Focus on these to stay on track
          </div>
        )}
      </div>

      {/* Tasks List */}
      {todaysTasks.length === 0 ? (
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 48,
            textAlign: "center",
            border: "1px solid #E5E7EB",
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌟</div>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
            You're All Caught Up!
          </h3>
          <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.6 }}>
            No urgent tasks for today. Take a break or get ahead on tomorrow's work.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {todaysTasks.map((mail, index) => {
            const priority = getPriorityScore(mail);
            const category = getEmailCategory(mail);
            const todoTitle = aiTodoTitles[mail.id] || getSimpleTodoTitle(mail);
            const isAIGenerated = !!aiTodoTitles[mail.id];

            // Generate AI title if not already generated
            if (!aiTodoTitles[mail.id]) {
              generateAITodoTitle(mail);
            }

            return (
              <div
                key={mail.id}
                onClick={() => {
                  openMailAndGenerateAI(mail.id, mail);
                  setShowFocusMode(false);
                  setActiveFolder("inbox");
                }}
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 28,
                  border: "2px solid #E5E7EB",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = "#6D28D9";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              >
                {/* Task Number Badge */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: priority >= 80 
                      ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
                      : "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
                  }}
                >
                  {index + 1}
                </div>

                {/* Task Title */}
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: isAIGenerated ? "#6D28D9" : "#111827",
                    marginBottom: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {todoTitle}
                </h3>

                {/* From */}
                <p
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                    marginBottom: 12,
                  }}
                >
                  <strong style={{ color: "#111827" }}>From:</strong> {mail.from?.split('<')[0].trim() || mail.from}
                </p>

                {/* Snippet */}
                <p
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  {mail.snippet?.substring(0, 150)}...
                </p>

                {/* Badges Row */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  {/* Priority Badge */}
                  <div
                    style={{
                      padding: "8px 16px",
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${getCategoryColor(category)}, #00000020)`,
                      color: "white",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {category} • {priority}
                  </div>

                  {/* AI Badge */}
                  {isAIGenerated && (
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)",
                        color: "white",
                      }}
                    >
                      ✨ AI
                    </span>
                  )}

                  {/* Date */}
                  <span style={{ fontSize: 13, color: "#9CA3AF", marginLeft: "auto" }}>
                    {mail.date}
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markDone();
                  }}
                  style={{
                    marginTop: 16,
                    padding: "12px 24px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 14,
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  ✅ Mark as Done
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Motivational Footer */}
      {todaysTasks.length > 0 && (
        <div
          style={{
            marginTop: 32,
            padding: 24,
            background: "linear-gradient(135deg, rgba(109, 40, 217, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)",
            borderRadius: 20,
            textAlign: "center",
            border: "1px solid #E5E7EB",
          }}
        >
          <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.6 }}>
            💪 <strong style={{ color: "#111827" }}>Pro Tip:</strong> Focus on one task at a time. 
            You've got this!
          </p>
        </div>
      )}
    </div>
  );
}
