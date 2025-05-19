import { useState } from 'react'
import Piano from 'react-piano-component'
import { Chord } from '@tonaljs/tonal'

function App() {
  const [rootNote, setRootNote] = useState('C')
  const [chordType, setChordType] = useState('major')
  const [inversion, setInversion] = useState(0)
  
  const chordTypes = [
    // Basic triads
    'major',
    'minor',
    'dim',
    'aug',
    'sus4',
    'sus2',
    
    // Seventh chords
    '7',
    'maj7',
    'm7',
    'dim7',
    'aug7',
    '7sus4',
    
    // Extended chords
    '9',
    'maj9',
    'm9',
    'add9',
    'madd9',
    '6',
    'm6',
    '69',
    'm69',
    
    // Added tone chords
    'add9',
    'madd9',
  ]

  const notes = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E',
    'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
  ]

  // Comprehensive map of enharmonic equivalents
  const enharmonicMap = {
    'C': ['C', 'Dbb', 'B#'],
    'C#': ['C#', 'Db', 'B##'],
    'Db': ['Db', 'C#', 'B##'],
    'D': ['D', 'C##', 'Ebb'],
    'D#': ['D#', 'Eb', 'Fbb'],
    'Eb': ['Eb', 'D#', 'Fbb'],
    'E': ['E', 'D##', 'Fb'],
    'F': ['F', 'E#', 'Gbb'],
    'F#': ['F#', 'Gb', 'E##'],
    'Gb': ['Gb', 'F#', 'E##'],
    'G': ['G', 'F##', 'Abb'],
    'G#': ['G#', 'Ab'],
    'Ab': ['Ab', 'G#'],
    'A': ['A', 'G##', 'Bbb'],
    'A#': ['A#', 'Bb', 'Cbb'],
    'Bb': ['Bb', 'A#', 'Cbb'],
    'B': ['B', 'A##', 'Cb'],
    
    // Include less common spellings mapping back
    'B#': ['B#', 'C', 'Dbb'],
    'B##': ['B##', 'C#', 'Db'],
    'Cb': ['Cb', 'B', 'A##'],
    'Cbb': ['Cbb', 'Bb', 'A#'],
    'C##': ['C##', 'D', 'Ebb'],
    'Dbb': ['Dbb', 'C', 'B#'],
    'D##': ['D##', 'E', 'Fb'],
    'Ebb': ['Ebb', 'D', 'C##'],
    'E#': ['E#', 'F', 'Gbb'],
    'Fb': ['Fb', 'E', 'D##'],
    'F##': ['F##', 'G', 'Abb'],
    'Gbb': ['Gbb', 'F', 'E#'],
    'G##': ['G##', 'A', 'Bbb'],
    'Abb': ['Abb', 'G', 'F##'],
    'A##': ['A##', 'B', 'Cb'],
    'Bbb': ['Bbb', 'A', 'G##'],
  };

  const getAllEnharmonicEquivalents = (note) => {
    // Return all listed equivalents for the given note, including the note itself
    return enharmonicMap[note] || [note];
  };

  // Function to get the correctly formatted chord name string for Tonal.js
  const getTonalChordName = () => {
    // Tonal.js expects chord names like 'Cmaj7', 'Cm', 'Cadd9', 'Cmadd9', etc.
    // For basic types like 'major', 'minor', 'dim', etc., rootNote + chordType works.
    // For 'add' types, it should be rootNote + chordType directly.
    if (chordType.startsWith('add') || chordType.startsWith('madd')) {
      return `${rootNote}${chordType}`;
    } else if (chordType === '5') { // Handle power chords if they were included
        return `${rootNote}5`;
    } else {
      return `${rootNote}${chordType}`;
    }
  };

  const getChordNotesRootPosition = () => {
    const chord = Chord.get(getTonalChordName());
    return chord.notes;
  };

  const getChordNotesInverted = () => {
    const chord = Chord.get(getTonalChordName());
    let notes = [...chord.notes]; // Create a copy to avoid mutating the original notes array from Tonal.js
    
    if (inversion > 0 && notes.length > 0) {
      for (let i = 0; i < inversion; i++) {
        const firstNote = notes.shift();
        if (firstNote) {
          notes.push(firstNote);
        }
      }
    }
    
    return notes;
  };

  const getNoteOriginalPosition = (noteWithoutOctave) => {
    const chordNotesRoot = getChordNotesRootPosition();
    // Check if the note or any of its enharmonic equivalents are in the root chord notes
    const possibleNames = getAllEnharmonicEquivalents(noteWithoutOctave);
    for (const name of possibleNames) {
        const position = chordNotesRoot.indexOf(name);
        if (position !== -1) {
            return position;
        }
    }
    return -1;
  }

  const isNoteInChord = (note) => {
    const chordNotes = getChordNotesInverted();
    const noteWithoutOctave = note.slice(0, -1);
    // Check if the piano key note or any of its enharmonic equivalents are in the inverted chord notes
    const possibleNames = getAllEnharmonicEquivalents(noteWithoutOctave);
    for (const name of possibleNames) {
        if (chordNotes.includes(name)) {
            return true;
        }
    }
    return false;
  }

  const getMaxInversions = () => {
    const chord = Chord.get(getTonalChordName())
    return chord.notes.length - 1
  }

  const getNoteDisplayName = (note) => {
    return note.slice(0, -1)
  }

  const getChordNoteRoles = () => {
    const chord = Chord.get(getTonalChordName());
    const roles = ['Root', 'Minor Third', 'Major Third', 'Fourth', 'Fifth', 'Minor Sixth', 'Major Sixth', 'Minor Seventh', 'Major Seventh', 'Ninth', 'Eleventh', 'Thirteenth', 'Flat Ninth', 'Sharp Ninth', 'Flat Fifth', 'Sharp Fifth', 'Flat Thirteenth', 'Sharp Eleventh'];
     // Map notes from inverted chord to their original position's role
    const invertedNotes = getChordNotesInverted();
    const rootNotes = getChordNotesRootPosition();

    return invertedNotes.map((note, index) => {
        // Find the index of the note or any of its enharmonic equivalents in the root position notes
        let originalIndex = -1;
        const possibleNames = getAllEnharmonicEquivalents(note);
        for(const name of possibleNames) {
            const idx = rootNotes.indexOf(name);
            if (idx !== -1) {
                originalIndex = idx;
                break; // Found the position, no need to check other enharmonics
            }
        }

        const role = originalIndex !== -1 ? roles[originalIndex] || `Extension ${originalIndex + 1}` : 'Unknown';
        return {
            note,
            role,
            originalIndex // Include original index for coloring
        };
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="container mx-auto w-full max-w-md sm:max-w-5xl bg-white shadow-lg rounded-3xl p-4 sm:p-8 mt-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-center text-gray-800 mb-6">Chord Visualizer</h1>
          
        {/* Consolidated and Responsive Control Section */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-8">
          {/* Root Note Selection */}
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-gray-700">Root:</span>
            <div className="flex flex-wrap gap-1">
              {notes.map(note => (
                <button
                  key={note}
                  onClick={() => setRootNote(note)}
                  className={`px-3 py-1 border-2 rounded-md text-base focus:outline-none ${rootNote === note ? 'bg-blue-600 text-white border-blue-600' : 'border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200'}`}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          {/* Chord Type Selection */}
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-gray-700">Type:</span>
            <div className="flex flex-wrap gap-1">
              {/* Basic Triads - Purple Theme */}
              {chordTypes.slice(0, 6).map(type => (
                <button 
                  key={type} 
                  onClick={() => setChordType(type)}
                  className={`px-3 py-1 border-2 rounded-md text-base focus:outline-none ${
                    chordType === type ? 'bg-purple-600 text-white border-purple-600' : 'border-purple-400 text-purple-800 bg-purple-100 hover:bg-purple-200'
                  }`}
                >
                  {type}
                </button>
              ))}
              {/* Seventh Chords - Yellow Theme */}
              {chordTypes.slice(6, 12).map(type => (
                <button 
                  key={type} 
                  onClick={() => setChordType(type)}
                  className={`px-3 py-1 border-2 rounded-md text-base focus:outline-none ${
                    chordType === type ? 'bg-yellow-600 text-white border-yellow-600' : 'border-yellow-400 text-yellow-800 bg-yellow-100 hover:bg-yellow-200'
                  }`}
                >
                  {type}
                </button>
              ))}
              {/* Extended Chords - Red Theme */}
              {chordTypes.slice(12, 21).map(type => (
                <button 
                  key={type} 
                  onClick={() => setChordType(type)}
                  className={`px-3 py-1 border-2 rounded-md text-base focus:outline-none ${
                    chordType === type ? 'bg-red-600 text-white border-red-600' : 'border-red-400 text-red-800 bg-red-100 hover:bg-red-200'
                  }`}
                >
                  {type}
                </button>
              ))}
              {/* Added Tone Chords - Indigo Theme */}
              {chordTypes.slice(21).map(type => (
                <button 
                  key={type} 
                  onClick={() => setChordType(type)}
                  className={`px-3 py-1 border-2 rounded-md text-base focus:outline-none ${
                    chordType === type ? 'bg-indigo-600 text-white border-indigo-600' : 'border-indigo-400 text-indigo-800 bg-indigo-100 hover:bg-indigo-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Inversion Selection - Green Theme */}
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-gray-700">Inversion:</span>
            <div className="flex flex-wrap gap-1">
              {[...Array(getMaxInversions() + 1)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setInversion(i)}
                  className={`px-3 py-1 border-2 rounded-md text-base focus:outline-none ${inversion === i ? 'bg-green-600 text-white border-green-600' : 'border-green-400 text-green-800 bg-green-100 hover:bg-green-200'}`}
                >
                  {i === 0 ? 'Root' : `${i}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Piano Container */}
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div className="piano-container overflow-x-auto w-full">
            <Piano
              startNote="C3"
              endNote="C6"
              renderPianoKey={({ note, isNoteAccidental, isNotePlaying }) => {
                const noteWithoutOctave = getNoteDisplayName(note)
                const isInChord = isNoteInChord(note)
                // Use original position for coloring
                const originalPosition = getNoteOriginalPosition(noteWithoutOctave)
                
                return (
                  <div
                    className={`
                      piano-key
                      ${isNoteAccidental ? 'black-key' : 'white-key'}
                      ${isInChord && originalPosition !== -1 ? `highlighted position-${originalPosition}` : ''}
                    `}
                  >
                    <span className={`note-name ${isNoteAccidental ? 'black-key-text' : 'white-key-text'}`}>
                      {noteWithoutOctave}
                    </span>
                  </div>
                )
              }}
            />
          </div>
        </div>

        {/* Chord Display and Legend */}
        <div className="text-center w-full">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {rootNote}{chordType} {inversion > 0 ? `(${inversion}${inversion === 1 ? 'st' : inversion === 2 ? 'nd' : inversion === 3 ? 'rd' : 'th'} inversion)` : ''}
          </h2>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {getChordNoteRoles().map(({ note, role, originalIndex }) => (
              <div key={note} className="flex flex-col items-center">
                {/* Use originalIndex for coloring legend items as well */}
                <div className={`legend-item position-${originalIndex}`}>
                  {note}
                </div>
                <span className="text-sm text-gray-600 mt-1">{role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
