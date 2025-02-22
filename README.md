# Audio-Captcha

## Overview
Audio-Captcha is a React component that provides an audio-based captcha to verify user interaction. Users must tap along with a rhythm played by the component to prove they are human. This solution is designed to be more engaging and effective against automated bots.

## Features
- Plays a randomly generated rhythm pattern.
- Records user taps and validates them against the generated pattern.
- Provides visual feedback on verification success or failure.
- Easy to integrate into any React application.

## Installation
To use the RhythmCaptcha component, ensure you have the following dependencies installed:
bash
npm install tone lucide-react zustand


## Usage
Import the RhythmCaptcha component into your React application and include it in your JSX.

```javascript
import React from 'react';
import RhythmCaptcha from './components/RhythmCaptcha';

function App() {
return (
    <div className="App">
        <h1>Audio Captcha Example</h1>
        <RhythmCaptcha />
    </div>
);
}       
export default App;
```



## Props
The RhythmCaptcha component does not accept any props.

## State Management
The component manages its own state internally using React's `useState` and `useEffect` hooks.

### Internal State
- `isPlaying`: Boolean indicating if the rhythm is currently playing.
- `taps`: Array of user taps recorded during the interaction.
- `pattern`: Array of intervals representing the generated rhythm pattern.
- `isVerifying`: Boolean indicating if the verification process is ongoing.
- `isPassed`: Boolean or null indicating if the user passed the verification.

## User Interaction
- **Play Pattern**: Users can click the "Play Pattern" button to hear the rhythm.
- **Tap**: Users can tap the designated area or press the spacebar to record their taps.
- **Verify**: After tapping, users can click the "Verify" button to check if their rhythm matches the generated pattern.

## Feedback
The component provides visual feedback based on the verification result:
- Displays "Verification Successful" or "Verification Failed" based on user input.

## Accessibility
Ensure that the component is accessible to all users, including those using assistive technologies. Consider adding ARIA roles and properties as needed.

## License
This component is open-source and can be used freely in your projects. Please provide attribution if used in public applications.

## Future Enhancements
- Consider adding difficulty levels for the rhythm patterns.
- Implement analytics to track user interactions and improve the captcha.
- Explore additional audio feedback options for user taps.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## Contact
For any questions or feedback, please reach out to far0213025@ju.edu.jo.