import React from "react";
import styles from "./CreateChannelModal.module.css";

function CreateChannelModal({
                                isOpen,
                                onClose,
                                newGroupName,
                                setNewGroupName,
                                newGroupDesc,
                                setNewGroupDesc,
                                handleCreateGroup
                            }) {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h3 className={styles.modalHeader}>Create New Channel</h3>
                <form onSubmit={handleCreateGroup} className={styles.modalForm}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="Channel Name"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Description (Optional)"
                            value={newGroupDesc}
                            onChange={e => setNewGroupDesc(e.target.value)}
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" className={styles.btnCancel} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.btnCreate}>
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateChannelModal;