// Admin Dashboard Logic
// Uses global supabaseClient from supabaseClient.js

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    checkAuthentication();
    
    // Load messages
    loadMessages();
    
    // Setup logout
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
});

// Check if user is authenticated
async function checkAuthentication() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error || !session) {
            // Not authenticated, redirect to login
            window.location.href = '../auth/login.html';
            return;
        }
        
        // User is authenticated, continue
        console.log('Admin authenticated:', session.user.email);
        
    } catch (error) {
        console.error('Authentication check error:', error);
        window.location.href = '../auth/login.html';
    }
}

// Load all messages from Supabase
async function loadMessages() {
    const messagesList = document.getElementById('messagesList');
    const messageCount = document.getElementById('messageCount');
    
    try {
        const { data: messages, error } = await supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            throw error;
        }
        
        // Update message count
        messageCount.textContent = `${messages.length} message${messages.length !== 1 ? 's' : ''}`;
        
        if (messages.length === 0) {
            messagesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>No messages yet</h3>
                    <p>Messages from the contact form will appear here.</p>
                </div>
            `;
            return;
        }
        
        // Render messages
        renderMessages(messages);
        
    } catch (error) {
        console.error('Error loading messages:', error);
        showError('Failed to load messages. Please try refreshing the page.');
        messagesList.innerHTML = `
            <div class="error-message">
                Failed to load messages. Please try refreshing the page.
            </div>
        `;
    }
}

// Setup realtime subscription for new messages
function setupRealtimeSubscription() {
    const messagesChannel = supabaseClient
        .channel('messages-realtime')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            },
            (payload) => {
                const newMessage = payload.new;
                
                // Update message count
                const messageCount = document.getElementById('messageCount');
                const currentCount = parseInt(messageCount.textContent);
                messageCount.textContent = `${currentCount + 1} message${currentCount + 1 !== 1 ? 's' : ''}`;
                
                // Remove empty state if it exists
                const emptyState = document.querySelector('.empty-state');
                if (emptyState) {
                    loadMessages(); // Reload to show proper list
                    return;
                }
                
                // Add new message to top of list
                const messagesList = document.getElementById('messagesList');
                const newMessageElement = document.createElement('div');
                newMessageElement.innerHTML = `
                    <div class="message-item" id="message-${newMessage.id}">
                        <div class="message-header">
                            <div class="message-info">
                                <div class="message-name">${escapeHtml(newMessage.name)}</div>
                                <div class="message-email">${escapeHtml(newMessage.email)}</div>
                                <div class="message-timestamp">${formatTimestamp(newMessage.created_at)}</div>
                            </div>
                            <div class="message-actions">
                                <button class="action-button edit-button" onclick="editMessage(${newMessage.id})">
                                    Edit
                                </button>
                                <button class="action-button delete-button" onclick="deleteMessage(${newMessage.id})">
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div class="message-content" id="content-${newMessage.id}">
                            ${escapeHtml(newMessage.message)}
                        </div>
                    </div>
                `;
                
                // Add to top of list with animation
                const firstChild = messagesList.firstChild;
                if (firstChild) {
                    messagesList.insertBefore(newMessageElement.firstElementChild, firstChild);
                } else {
                    messagesList.appendChild(newMessageElement.firstElementChild);
                }
                
                // Flash animation for new message
                const newElement = document.getElementById(`message-${newMessage.id}`);
                newElement.style.background = 'rgba(34, 197, 94, 0.1)';
                setTimeout(() => {
                    newElement.style.background = '';
                }, 2000);
            }
        )
        .subscribe();

    // Add cleanup listener for page unload
    window.addEventListener("beforeunload", () => {
        supabaseClient.removeChannel(messagesChannel);
    });
}

// Initialize realtime subscription after loading messages
setupRealtimeSubscription();

// Render messages in the UI
function renderMessages(messages) {
    const messagesList = document.getElementById('messagesList');
    
    messagesList.innerHTML = messages.map(message => `
        <div class="message-item" id="message-${message.id}">
            <div class="message-header">
                <div class="message-info">
                    <div class="message-name">${escapeHtml(message.name)}</div>
                    <div class="message-email">${escapeHtml(message.email)}</div>
                    <div class="message-timestamp">${formatTimestamp(message.created_at)}</div>
                </div>
                <div class="message-actions">
                    <button class="action-button edit-button" onclick="editMessage(${message.id})">
                        Edit
                    </button>
                    <button class="action-button delete-button" onclick="deleteMessage(${message.id})">
                        Delete
                    </button>
                </div>
            </div>
            <div class="message-content" id="content-${message.id}">
                ${escapeHtml(message.message)}
            </div>
        </div>
    `).join('');
}

// Edit a message
window.editMessage = async function(messageId) {
    const contentDiv = document.getElementById(`content-${messageId}`);
    const currentMessage = contentDiv.textContent.trim();
    
    // Switch to edit mode
    contentDiv.classList.add('editing');
    contentDiv.innerHTML = `
        <textarea class="edit-textarea" id="edit-${messageId}">${escapeHtml(currentMessage)}</textarea>
        <div class="edit-actions">
            <button class="action-button save-button" onclick="saveMessage(${messageId})">
                Save
            </button>
            <button class="action-button cancel-button" onclick="cancelEdit(${messageId})">
                Cancel
            </button>
        </div>
    `;
    
    // Focus on textarea
    document.getElementById(`edit-${messageId}`).focus();
};

// Save edited message
window.saveMessage = async function(messageId) {
    const textarea = document.getElementById(`edit-${messageId}`);
    const newMessage = textarea.value.trim();
    
    if (!newMessage) {
        showError('Message cannot be empty.');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .update({ message: newMessage })
            .eq('id', messageId)
            .select();
        
        if (error) {
            throw error;
        }
        
        // Update UI
        const contentDiv = document.getElementById(`content-${messageId}`);
        contentDiv.classList.remove('editing');
        contentDiv.textContent = newMessage;
        
        showSuccess('Message updated successfully.');
        
    } catch (error) {
        console.error('Error updating message:', error);
        showError('Failed to update message. Please try again.');
    }
};

// Cancel edit
window.cancelEdit = function(messageId) {
    loadMessages(); // Reload to restore original state
};

// Delete a message
window.deleteMessage = async function(messageId) {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('messages')
            .delete()
            .eq('id', messageId);
        
        if (error) {
            throw error;
        }
        
        // Remove message from UI with animation
        const messageElement = document.getElementById(`message-${messageId}`);
        messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            messageElement.remove();
            
            // Update message count
            const messageCount = document.getElementById('messageCount');
            const currentCount = parseInt(messageCount.textContent);
            messageCount.textContent = `${currentCount - 1} message${currentCount - 1 !== 1 ? 's' : ''}`;
            
            // Check if empty
            const remainingMessages = document.querySelectorAll('.message-item');
            if (remainingMessages.length === 0) {
                loadMessages(); // Reload to show empty state
            }
        }, 300);
        
        showSuccess('Message deleted successfully.');
        
    } catch (error) {
        console.error('Error deleting message:', error);
        showError('Failed to delete message. Please try again.');
    }
};

// Handle logout
async function handleLogout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        // Redirect to login page
        window.location.href = '../auth/login.html';
        
    } catch (error) {
        console.error('Logout error:', error);
        showError('Failed to logout. Please try again.');
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
        return 'Just now';
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function showError(message) {
    const container = document.getElementById('errorContainer');
    container.innerHTML = `<div class="error-message">${message}</div>`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

function showSuccess(message) {
    const container = document.getElementById('successContainer');
    container.innerHTML = `<div class="success-message">${message}</div>`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 3000);
}
