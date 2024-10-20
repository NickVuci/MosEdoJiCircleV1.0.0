// sound.js

// Base frequency (e.g., A4 = 440 Hz)
const baseFrequency = 440;

// Declare a singleton AudioContext
let audioContext;

// Function to play the interval
export function playInterval(cents) {
    const selectedWaveform = d3.select('#sound-waveform').property('value');

    // Check if sound is enabled
    if (selectedWaveform === 'off') {
        return; // Do not play sound
    }

    // Create AudioContext if not already created
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Calculate the frequency of the interval
    const frequency = baseFrequency * Math.pow(2, cents / 1200);

    // Create an oscillator node
    const oscillator = audioContext.createOscillator();
    oscillator.type = selectedWaveform;

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Create a gain node to control volume
    const gainNode = audioContext.createGain();

    // Connect the oscillator to the gain node and the gain node to the destination
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start the oscillator
    oscillator.start();

    // Stop the oscillator after a duration (e.g., 1 second)
    oscillator.stop(audioContext.currentTime + 1);

    // Fade out the sound smoothly
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
}
