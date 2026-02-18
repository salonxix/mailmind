"use client";

export default function EmailList(props: any) {
    const {
        emails,
        filteredEmails,
        activeTab,
        setActiveTab,
        selectedMail,
        openMailAndGenerateAI,
        generateAIPriorityForMail,
        getPriorityScore,
        getPriorityColor,
        isSpamEmail,
        isFirstTimeSender,
        nextPageToken,
        loadEmails,
        loading,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        deadlineFilter,
        setDeadlineFilter,
        extractDeadline,
    } = props;

    return (
        <div
            style={{
                width: "35%",
                borderRight: "1px solid #E5E7EB",
                overflowY: "auto",
                background: "white",
            }}
        >
            {/* Tabs */}
            <div
                style={{
                    padding: 15,
                    borderBottom: "1px solid #E5E7EB",
                    background: "#F8FAFF",
                }}
            >
                {/* Category Tabs */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {["All Mails", "Do Now", "Waiting", "Needs Decision", "Low Energy"].map(
                        (tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: 10,
                                    border: "none",
                                    cursor: "pointer",
                                    background:
                                        activeTab === tab
                                            ? "linear-gradient(135deg,#6D28D9,#2563EB)"
                                            : "#E5E7EB",
                                    color: activeTab === tab ? "white" : "#111827",
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                {tab}
                            </button>
                        )
                    )}
                </div>
                
                {/* Enhanced Sort & Filter Controls */}
                <div style={{ 
                    display: "flex", 
                    gap: 8, 
                    alignItems: "center", 
                    flexWrap: "wrap",
                    paddingTop: 8,
                    borderTop: "1px solid #E5E7EB"
                }}>
                    {/* Sort By Dropdown */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid #E5E7EB",
                                background: sortBy !== "none" ? "#EEF2FF" : "white",
                                color: sortBy !== "none" ? "#6D28D9" : "#111827",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            <option value="none">None</option>
                            <option value="priority">⚡ Priority</option>
                            <option value="deadline">📅 Deadline</option>
                            <option value="date">🕒 Date</option>
                            <option value="sender">👤 Sender</option>
                        </select>
                    </div>

                    {/* Sort Order Toggle */}
                    {sortBy !== "none" && (
                        <button
                            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: "1px solid #E5E7EB",
                                background: "#EEF2FF",
                                color: "#6D28D9",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                            }}
                            title={sortOrder === "desc" ? "Descending" : "Ascending"}
                        >
                            {sortOrder === "desc" ? "↓" : "↑"}
                            {sortOrder === "desc" ? "High→Low" : "Low→High"}
                        </button>
                    )}

                    {/* Deadline Filter */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Filter:</span>
                        <select
                            value={deadlineFilter}
                            onChange={(e) => setDeadlineFilter(e.target.value as any)}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid #E5E7EB",
                                background: deadlineFilter !== "all" ? "#FEF3C7" : "white",
                                color: deadlineFilter !== "all" ? "#92400E" : "#111827",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            <option value="all">All Emails</option>
                            <option value="today">🔥 Today</option>
                            <option value="tomorrow">⚠️ Tomorrow</option>
                            <option value="week">📅 This Week</option>
                            <option value="overdue">⏰ Overdue</option>
                        </select>
                    </div>
                </div>
                
                {/* Active Sort/Filter Indicator */}
                {(sortBy !== "none" || deadlineFilter !== "all") && (
                    <div style={{ 
                        marginTop: 10, 
                        padding: "6px 10px", 
                        background: "linear-gradient(135deg, rgba(109, 40, 217, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)",
                        borderRadius: 8,
                        fontSize: 11,
                        color: "#6D28D9",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "space-between"
                    }}>
                        <span>
                            {sortBy !== "none" && `Sorted by ${sortBy} (${sortOrder})`}
                            {sortBy !== "none" && deadlineFilter !== "all" && " • "}
                            {deadlineFilter !== "all" && `Showing ${deadlineFilter} emails`}
                        </span>
                        <button
                            onClick={() => {
                                setSortBy("none");
                                setDeadlineFilter("all");
                            }}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "#6D28D9",
                                cursor: "pointer",
                                fontSize: 11,
                                fontWeight: 700,
                                textDecoration: "underline",
                            }}
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Email Items */}
            <div style={{ 
                padding: "10px 12px", 
                background: "#F3F4F6", 
                fontSize: 12, 
                fontWeight: 600, 
                color: "#6B7280",
                borderBottom: "1px solid #E5E7EB"
            }}>
                {filteredEmails.length} {filteredEmails.length === 1 ? "email" : "emails"}
                {sortBy !== "none" && ` • Sorted by ${sortBy}`}
            </div>
            
            {filteredEmails.map((mail: any, index: number) => {
                const score = getPriorityScore(mail);
                const text = (mail.subject || "") + " " + (mail.snippet || "");
                const deadline = extractDeadline(text);

                return (
                    <div
                        key={mail.id + "_" + index}
                        onClick={() => {
                            openMailAndGenerateAI(mail.id, mail);
                            generateAIPriorityForMail(mail);
                        }}
                        style={{
                            margin: "10px",
                            padding: "14px 16px",
                            borderRadius: 18,
                            cursor: "pointer",
                            display: "flex",
                            gap: 14,
                            alignItems: "flex-start",
                            background:
                                selectedMail?.id === mail.id
                                    ? "rgba(99,102,241,0.12)"
                                    : "white",
                            boxShadow:
                                selectedMail?.id === mail.id
                                    ? "0 8px 20px rgba(99,102,241,0.25)"
                                    : "0 2px 10px rgba(0,0,0,0.06)",
                            transition: "all 0.25s ease",
                        }}
                    >
                        {/* Avatar */}
                        <div
                            style={{
                                width: 46,
                                height: 46,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg,#6D28D9,#2563EB)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: 16,
                                color: "white",
                                flexShrink: 0,
                            }}
                        >
                            {mail.from?.charAt(0)?.toUpperCase() || "M"}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                            {/* Sender */}
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#111827",
                                }}
                            >
                                {mail.from?.split("<")[0] || "Unknown Sender"}
                            </p>

                            {/* Subject */}
                            <h4
                                style={{
                                    margin: "4px 0",
                                    fontSize: 15,
                                    fontWeight: 800,
                                    color: "#1F2937",
                                }}
                            >
                                {mail.subject || "No Subject"}
                            </h4>

                            {/* Snippet */}
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 13,
                                    color: "#6B7280",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "250px",
                                }}
                            >
                                {mail.snippet}
                            </p>

                            {/* Tags */}
                            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        padding: "4px 10px",
                                        borderRadius: 999,
                                        background: getPriorityColor(score),
                                        color: "white",
                                    }}
                                >
                                    ⚡ {score}
                                </span>

                                {deadline && (
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            background: deadline === "Today" 
                                                ? "#EF4444" 
                                                : deadline === "Tomorrow" 
                                                ? "#F59E0B" 
                                                : "#8B5CF6",
                                            color: "white",
                                        }}
                                    >
                                        📅 {deadline}
                                    </span>
                                )}

                                {isSpamEmail(mail) && (
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            background: "#DC2626",
                                            color: "white",
                                        }}
                                    >
                                        🚫 Spam
                                    </span>
                                )}

                                {isFirstTimeSender(mail, emails) && (
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            background: "#2563EB",
                                            color: "white",
                                        }}
                                    >
                                        🆕 New
                                    </span>
                                )}
                            </div>

                            {/* Meter */}
                            <div
                                style={{
                                    marginTop: 10,
                                    height: 6,
                                    width: "100%",
                                    borderRadius: 999,
                                    background: "#E5E7EB",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${score}%`,
                                        borderRadius: 999,
                                        background: getPriorityColor(score),
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Load More */}
            {nextPageToken && (
                <button
                    onClick={loadEmails}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 14,
                        background: loading ? "#E5E7EB" : "#2563EB",
                        color: "white",
                        border: "none",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    {loading ? "Loading..." : "Load More"}
                </button>
            )}
        </div>
    );
}
