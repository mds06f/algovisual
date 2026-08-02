// public/js/socketPlayer.js

document.addEventListener('DOMContentLoaded', () => {
  // Delay slightly to let initPlayer fully initialize window.visualizerPlayer
  setTimeout(() => {
    initSocketPlayer();
  }, 100);
});

function initSocketPlayer() {
  const btnCreateRoom = document.getElementById('btn-create-room');
  const roomStatusBadge = document.getElementById('room-status-badge');
  const textRoomId = document.getElementById('text-room-id');
  const btnCopyInvite = document.getElementById('btn-copy-invite');

  // 1. Room Creation Handlers
  if (btnCreateRoom) {
    btnCreateRoom.addEventListener('click', () => {
      // Generate a random 6-character room code
      const randomRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const params = new URLSearchParams(window.location.search);
      const currentAlgo = params.get('algo') || 'bubbleSort';
      // Redirect host to the room route
      window.location.href = `/room/${randomRoomId}?algo=${currentAlgo}`;
    });
  }

  const roomId = window.ROOM_ID;
  if (!roomId) {
    // We are in local mode
    if (btnCreateRoom) btnCreateRoom.classList.remove('hidden');
    if (roomStatusBadge) roomStatusBadge.classList.add('hidden');
    return;
  }

  // We are in synchronized room mode
  if (btnCreateRoom) btnCreateRoom.classList.add('hidden');
  if (roomStatusBadge) {
    roomStatusBadge.classList.remove('hidden');
    if (textRoomId) textRoomId.textContent = roomId;
  }

  if (btnCopyInvite) {
    btnCopyInvite.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Invite link copied to clipboard!');
      }).catch((err) => {
        console.error('Failed to copy invite link:', err);
      });
    });
  }

  // Verify visualizer player exists
  if (!window.visualizerPlayer) {
    console.error('Visualizer player state is not exposed.');
    return;
  }

  // 2. Initialize Socket.io connection
  const socket = io();
  let incomingUpdate = false;

  // Join the specified room ID
  socket.emit('JOIN_ROOM', roomId);

  // Broadcast current algorithm upon connection to synchronize students
  const params = new URLSearchParams(window.location.search);
  const currentAlgo = params.get('algo') || 'bubbleSort';
  socket.emit('ALGO_CHANGE', { roomId, algo: currentAlgo });

  // 3. Setup hooks to broadcast local player events
  window.visualizerPlayer.onStepRendered = (index) => {
    if (incomingUpdate) return;
    socket.emit('PLAYBACK_STEP', {
      roomId: roomId,
      index: index,
      isPlaying: window.visualizerPlayer.isPlaying()
    });
  };

  window.visualizerPlayer.onPlayroomReset = (array, target) => {
    if (incomingUpdate) return;
    socket.emit('ARRAY_UPDATE', {
      roomId: roomId,
      array: array,
      target: target
    });
  };

  // 4. Handle incoming synchronized socket events
  socket.on('PLAYBACK_STEP', ({ index, isPlaying }) => {
    incomingUpdate = true;

    // Sync playback position
    if (window.visualizerPlayer.getCurrentIndex() !== index) {
      window.visualizerPlayer.setCurrentIndex(index);
      window.visualizerPlayer.renderSnapshot(index);
    }

    // Sync playing/loop state
    const currentlyPlaying = window.visualizerPlayer.isPlaying();
    if (isPlaying && !currentlyPlaying) {
      window.visualizerPlayer.startAnimation();
    } else if (!isPlaying && currentlyPlaying) {
      window.visualizerPlayer.pauseAnimation();
    }

    // Delay resetting the update flag to allow callbacks to settle
    setTimeout(() => {
      incomingUpdate = false;
    }, 10);
  });

  socket.on('ALGO_CHANGE', ({ algo }) => {
    incomingUpdate = true;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('algo') !== algo) {
      window.location.href = `/room/${roomId}?algo=${algo}`;
    }
    setTimeout(() => {
      incomingUpdate = false;
    }, 10);
  });

  socket.on('ARRAY_UPDATE', ({ array, target }) => {
    incomingUpdate = true;
    window.visualizerPlayer.setDefaultArray(array);
    window.visualizerPlayer.resetPlayroom(array, target);
    setTimeout(() => {
      incomingUpdate = false;
    }, 10);
  });
}
