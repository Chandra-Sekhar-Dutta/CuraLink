# Connection & Chat Testing Guide

## Overview
This guide will help you test the new researcher connection and chat features.

## Prerequisites
- Create at least 2 researcher accounts
- Both accounts should have completed their profile setup

## Testing Flow

### Step 1: Setup Test Accounts
1. **Create Researcher Account A**
   - Sign up as researcher
   - Complete profile setup with specialties, affiliation, etc.

2. **Create Researcher Account B**
   - Sign up as researcher  
   - Complete profile setup with specialties, affiliation, etc.

### Step 2: Test Finding Researchers
1. **Sign in as Researcher A**
2. Go to Dashboard → Click **"Find Researchers"** in the Quick Links
3. You should see a list of all researchers (including Researcher B)
4. Use the search bar to filter by name, email, or affiliation
5. Each researcher card shows:
   - Avatar (image or initials)
   - Name, email
   - Position, affiliation
   - Specialties (up to 3 tags)
   - Connection status button

### Step 3: Send Connection Request
1. **Still as Researcher A**
2. Find Researcher B's card
3. Click **"➕ Connect"** button
4. Button should change to **"⏳ Pending"** (yellow, disabled)
5. Success message should appear

### Step 4: Accept Connection Request
1. **Sign out and sign in as Researcher B**
2. Go to Dashboard → Click **"My Connections"** in the Quick Links
3. You should see **Pending (1)** tab highlighted
4. Researcher A's connection request should appear with:
   - Avatar and name
   - "Sent you a connection request" message
   - Date of request
5. Click **"✓ Accept"** button
6. Connection should move to **Connected** tab

### Step 5: Verify Connection Status
1. **As Researcher B**, go to **Find Researchers** page
2. Find Researcher A's card
3. Button should now show **"💬 Chat"** (green)
4. Click **"💬 Chat"** - you'll be redirected to the chat page

### Step 6: Test Chat Messaging
1. **Still as Researcher B** in the chat page
2. You should see:
   - Left sidebar: List of conversations (showing Researcher A)
   - Right panel: Chat window with Researcher A selected
3. Type a message in the input box at the bottom
4. Click **Send** or press Enter
5. Message should appear in purple bubble on the right

6. **Sign in as Researcher A**
7. Go to Dashboard → Click **"Messages"** in the Quick Links
8. You should see:
   - Researcher B in the conversation list with a **red badge** (unread count)
   - Latest message preview
9. Click on Researcher B's conversation
10. Previous message from B should appear in gray bubble on the left
11. Send a reply message
12. Your message appears in purple on the right

7. **Switch back to Researcher B**
8. The chat should auto-refresh (every 3 seconds)
9. You should see the new message from A
10. Red unread badge should disappear once you view the message

### Step 7: Test Connections Management
1. **Sign in as either researcher**
2. Go to Dashboard → Click **"My Connections"**
3. Test the three tabs:
   - **Pending**: Shows requests awaiting response
   - **Connected**: Shows accepted connections with "💬 Chat" button
   - **Rejected**: Shows rejected requests

### Step 8: Test Connection Rejection (Optional)
1. **Sign in as Researcher A**
2. Find another researcher (create Researcher C if needed)
3. Send connection request to Researcher C
4. **Sign in as Researcher C**
5. Go to **My Connections** → **Pending** tab
6. Click **"✗ Reject"** button
7. Connection should move to **Rejected** tab
8. **Sign in as Researcher A**
9. Go to **Find Researchers**
10. Researcher C's card should show **"❌ Rejected"** (gray, disabled)

## Features to Verify

### Find Researchers Page
- ✅ Search bar filters by name/email/affiliation
- ✅ Researcher cards show all relevant info
- ✅ Connection buttons show correct status
- ✅ "Connect" button sends request
- ✅ Button states update after actions
- ✅ View Profile button works

### Connections Page
- ✅ Three tabs: Pending, Connected, Rejected
- ✅ Badge counts show correct numbers
- ✅ Pending requests show action buttons
- ✅ Only request receivers can accept/reject
- ✅ Requesters see "Awaiting Response" label
- ✅ Connected tab shows "Chat" button
- ✅ Empty states display properly

### Chat Page
- ✅ Conversation list shows all connected researchers
- ✅ Unread badge appears on new messages
- ✅ Latest message preview displays
- ✅ Clicking conversation loads chat history
- ✅ Messages send successfully
- ✅ Sent messages appear on right (purple)
- ✅ Received messages appear on left (gray)
- ✅ Auto-refresh every 3 seconds
- ✅ Messages marked as read when viewed
- ✅ Timestamps display correctly

### Dashboard Quick Links
- ✅ "Find Researchers" navigates to search page
- ✅ "My Connections" navigates to connections page
- ✅ "Messages" navigates to chat page
- ✅ All links work and are accessible

## Common Issues & Solutions

### Issue: "Not connected" error when trying to chat
- **Solution**: Make sure connection is accepted by both parties
- Check in **My Connections** → **Connected** tab

### Issue: Messages not appearing
- **Solution**: Wait for auto-refresh (3 seconds) or reload page
- Check browser console for errors

### Issue: Can't send connection request
- **Solution**: 
  - Can't send to yourself
  - Can't send duplicate requests
  - Must be signed in as researcher

### Issue: Can't find researcher in search
- **Solution**: 
  - Make sure they completed profile setup
  - Check spelling in search bar
  - Try searching by email instead

### Issue: Unread badge not disappearing
- **Solution**: 
  - Click on the conversation to load messages
  - Messages are marked read when chat window opens

## API Endpoints Used

1. **GET /api/researcher/find** - Fetch all researchers with connection status
2. **GET /api/researcher/connections** - List all connections
3. **POST /api/researcher/connections** - Send connection request
4. **PATCH /api/researcher/connections** - Accept/reject request
5. **GET /api/researcher/chat?userId=X** - Fetch messages with user X
6. **POST /api/researcher/chat** - Send message
7. **PUT /api/researcher/chat** - List all conversations

## Database Tables Involved

1. **users** - User accounts
2. **researcherProfiles** - Researcher details (affiliation, specialties, etc.)
3. **researcherConnections** - Connection requests and status
4. **chatMessages** - Chat messages between researchers

## Next Steps

After testing, you can:
- Customize connection request notifications
- Add real-time updates using WebSockets
- Implement message search functionality
- Add file/image sharing in chat
- Create group chat functionality
- Add video call integration

## Feedback & Issues

If you encounter any bugs or have suggestions:
1. Check browser console for errors
2. Check network tab for failed API calls
3. Verify database has correct data
4. Report issues with screenshots and steps to reproduce
