import React from "react";
import styles from "./GroupSettingsModal.module.css";

function GroupSettingsModal({ isOpen, onClose, selectedChat, user, isAdmin, handleRemoveMember, handleAddUserToGroup, getAvailableUsers, handleDeleteGroup }) {
    if (!isOpen) return null;

    const availableUsers = getAvailableUsers();

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>

                <h2 className={styles.modalHeader}>
                    Settings: <span className={styles.channelName}>{selectedChat?.name}</span>
                </h2>

                <div className={styles.modalBody}>
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            Members ({selectedChat.members?.length || 0})
                        </h3>
                        <div className={styles.memberList}>
                            {selectedChat.members?.map(m => {
                                const isMe = m.userId === user.id;
                                const initial = m.user?.username?.charAt(0).toUpperCase() || "?";

                                return (
                                    <div key={m.userId} className={styles.memberItem}>
                                        <div className={styles.memberInfo}>
                                            <div className={`${styles.avatar} ${!isMe ? styles.avatarGray : ''}`}>
                                                {initial}
                                            </div>
                                            <span className={styles.memberName}>
                                                {m.user?.username} {isMe && "(me)"}
                                            </span>
                                        </div>

                                        {isMe ? (
                                            <span className={styles.badge}>Admin</span>
                                        ) : (
                                            isAdmin && (
                                                <button onClick={() => handleRemoveMember(m.userId)} className={styles.btnKick}>
                                                    Kick
                                                </button>
                                            )
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>


                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Add New Members</h3>

                        {availableUsers.length > 0 ? (
                            <div className={styles.memberList}>
                                {availableUsers.map(u => (
                                    <div key={u.id} className={styles.memberItem}>
                                        <div className={styles.memberInfo}>
                                            <div className={`${styles.avatar} ${styles.avatarGray}`}>
                                                {u.username?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <span className={styles.memberName}>{u.username}</span>
                                        </div>
                                        <button onClick={() => handleAddUserToGroup(u.id)} className={styles.btnPrimarySmall}>
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                No users available to add
                            </div>
                        )}
                    </div>
                </div>


                <div className={styles.modalFooter}>
                    {isAdmin && (
                        <button onClick={handleDeleteGroup} className={styles.btnDangerText}>
                            Delete Channel
                        </button>
                    )}
                    <button type="button" className={styles.btnPrimary} onClick={onClose}>
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}

export default GroupSettingsModal;