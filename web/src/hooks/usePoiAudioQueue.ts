// import { useState, useCallback, useRef, useEffect } from 'react';
// import type { POI } from '@/components/Map/MapView';

// export function usePoiAudioQueue() {
//   const [queue, setQueue] = useState<POI[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(-1);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const objectUrlRef = useRef<string | null>(null);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState<number | undefined>(undefined);

//   // Initialize audio element
//   useEffect(() => {
//     const audio = new Audio();

//     const onEnded = () => handleAudioEnded();
//     const onPlay = () => setIsPlaying(true);
//     const onPause = () => setIsPlaying(false);
//     const onTimeUpdate = () => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); };
//     const onDurationChange = () => { if (audioRef.current) setDuration(isFinite(audioRef.current.duration) ? audioRef.current.duration : undefined); };
//     const onError = (e: any) => {
//       console.error('Audio element error', e);
//       try {
//         const err = audio.error;
//         console.error('MediaError:', err && err.code, err && err.message, 'src=', audio.src);
//       } catch (ex) {
//         // ignore
//       }
//     };

//     audio.addEventListener('ended', onEnded);
//     audio.addEventListener('play', onPlay);
//     audio.addEventListener('pause', onPause);
//     audio.addEventListener('timeupdate', onTimeUpdate);
//     audio.addEventListener('durationchange', onDurationChange);
//     audio.addEventListener('error', onError as any);

//     audioRef.current = audio;

//     return () => {
//       audio.removeEventListener('ended', onEnded);
//       audio.removeEventListener('play', onPlay);
//       audio.removeEventListener('pause', onPause);
//       audio.removeEventListener('timeupdate', onTimeUpdate);
//       audio.removeEventListener('durationchange', onDurationChange);
//       audio.removeEventListener('error', onError as any);
//       audio.pause();
//       if (objectUrlRef.current) {
//         URL.revokeObjectURL(objectUrlRef.current);
//         objectUrlRef.current = null;
//       }
//       audioRef.current = null;
//     };
//   }, []);

//   const handleAudioEnded = useCallback(() => {
//     setIsPlaying(false);
//     skip('next');
//   }, []);

//   const play = useCallback(() => {
//     if (audioRef.current) {
//       audioRef.current.play().catch(e => console.error("Audio play failed", e));
//     }
//   }, []);

//   const pause = useCallback(() => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//     }
//   }, []);

//   // Update audio source when current index changes
//   useEffect(() => {
//     const currentPoi = queue[currentIndex];
//     if (audioRef.current && currentPoi && currentPoi.audioUrl) {
//       // Ensure we don't reload the same audio url
//       const src = currentPoi.audioUrl;
//           const setSource = async () => {
//         try {
//           // Revoke previous object URL if any
//           if (objectUrlRef.current) {
//             URL.revokeObjectURL(objectUrlRef.current);
//             objectUrlRef.current = null;
//           }

//           // Helper to detect a raw base64 payload (no data: prefix)
//           const looksLikeBase64 = (s: string) => /^[A-Za-z0-9+/=\s]+$/.test(s);

//           if (src.startsWith('data:')) {
//             // Convert data URI to Blob then to object URL
//             const blob = dataURItoBlob(src);
//             const obj = URL.createObjectURL(blob);
//             objectUrlRef.current = obj;
//             if (audioRef.current) audioRef.current.src = obj;
//           } else if (looksLikeBase64(src)) {
//             // Raw base64 string without data: prefix — assume WAV
//             const blob = dataURItoBlob('data:audio/wav;base64,' + src.trim());
//             const obj = URL.createObjectURL(blob);
//             objectUrlRef.current = obj;
//             if (audioRef.current) audioRef.current.src = obj;
//           } else if (src.startsWith('http') || src.startsWith('/')) {
//             if (audioRef.current) audioRef.current.src = src;
//           } else {
//             // unknown format — try assigning directly
//             if (audioRef.current) audioRef.current.src = src;
//           }

//           if (audioRef.current) {
//             audioRef.current.load();
//             play(); // Auto-play when switching tracks
//           }
//         } catch (e) {
//           console.error('Failed to set audio source', e);
//         }
//       };

//       // only set if different logical source (not comparing object URLs)
//       setSource();
//     }
//   }, [currentIndex, queue, play]);

//   // helper: convert data URI to Blob
//   function dataURItoBlob(dataURI: string) {
//     const split = dataURI.split(',');
//     const header = split[0];
//     const data = split[1];
//     const isBase64 = header.indexOf('base64') >= 0;
//     let byteString: string;
//     if (isBase64) {
//       byteString = atob(data);
//     } else {
//       byteString = decodeURIComponent(data);
//     }

//     const mimeMatch = header.match(/:(.*?);/);
//     const mime = mimeMatch ? mimeMatch[1] : 'audio/wav';
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ab], { type: mime });
//   }

//   const enqueue = useCallback((poi: POI) => {
//     setQueue((prevQueue) => {
//       // Avoid duplicate POIs in queue
//       if (prevQueue.some(p => p.id === poi.id)) {
//         return prevQueue;
//       }
      
//       const newQueue = [...prevQueue, poi];
      
//       // If this is the first item, start playing it
//       if (newQueue.length === 1) {
//         setCurrentIndex(0);
//       }
      
//       return newQueue;
//     });
//   }, []);

//   const skip = useCallback((direction: 'next' | 'prev') => {
//     setQueue((prevQueue) => {
//       if (prevQueue.length === 0) return prevQueue;
      
//       setCurrentIndex((prevIndex) => {
//         let nextIndex = prevIndex;
//         if (direction === 'next') {
//           nextIndex = prevIndex + 1;
//         } else {
//           nextIndex = prevIndex - 1;
//         }

//         // Handle bounds (stop if at end, stay at 0 if at start)
//         if (nextIndex >= prevQueue.length) {
//           // End of queue
//           pause();
//           return prevIndex; // Keep the last index to show UI, but not playing
//         }
        
//         if (nextIndex < 0) {
//           nextIndex = 0;
//         }
        
//         return nextIndex;
//       });
//       return prevQueue;
//     });
//   }, [pause]);

//   const clearQueue = useCallback(() => {
//     setQueue([]);
//     setCurrentIndex(-1);
//     pause();
//     if (audioRef.current) {
//       audioRef.current.src = '';
//     }
//   }, [pause]);

//   const currentPoi = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

//   return {
//     currentPoi,
//     queue,
//     currentIndex,
//     isPlaying,
//     audioRef,
//     currentTime,
//     duration,
//     enqueue,
//     skip,
//     play,
//     pause,
//     clearQueue,
//   };
// }
import { useState, useCallback, useRef, useEffect } from 'react';
import type { POI } from '@/components/Map/MapView';

export function usePoiAudioQueue() {
  const [queue, setQueue] = useState<POI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | undefined>(undefined);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();

    const onEnded = () => skip('next');
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); };
    const onDurationChange = () => {
      if (audioRef.current) setDuration(isFinite(audioRef.current.duration) ? audioRef.current.duration : undefined);
    };
    const onError = (e: any) => {
      console.error('Audio element error', e);
      try {
        const err = audio.error;
        console.error('MediaError:', err?.code, err?.message, 'src=', audio.src.slice(0, 80));
      } catch { /* ignore */ }
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('error', onError as any);

    audioRef.current = audio;

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('error', onError as any);
      audio.pause();
      revokeObjectUrl();
      audioRef.current = null;
    };
  }, []);

  function revokeObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  // Resolve audioUrl to a playable src string
  function resolveAudioSrc(audioUrl: string): string {
    const trimmed = audioUrl.trim();

    // Already a data URI → use directly, no need to convert to Blob
    if (trimmed.startsWith('data:')) {
      return trimmed;
    }

    // HTTP/HTTPS or relative path → use directly
    if (trimmed.startsWith('http') || trimmed.startsWith('/')) {
      return trimmed;
    }

    // Raw base64 without prefix → assume WAV
    if (/^[A-Za-z0-9+/]/.test(trimmed)) {
      return `data:audio/wav;base64,${trimmed}`;
    }
    console.warn('Unknown audioUrl format, using as-is:', trimmed);
    return trimmed;
  }

  const play = useCallback(() => {
    audioRef.current?.play().catch(e => console.error('Audio play failed', e));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    const currentPoi = queue[currentIndex];
    if (!audioRef.current || !currentPoi) return;

    if (!currentPoi.audioUrl) {
      console.warn('POI has no audioUrl:', currentPoi.id, currentPoi.title);
      return;
    }

    revokeObjectUrl();

    const src = resolveAudioSrc(currentPoi.audioUrl);
    audioRef.current.src = src;
    audioRef.current.load();
    audioRef.current.play().catch(e => console.error('Audio play failed', e));
  }, [currentIndex, queue]);

  const enqueue = useCallback((poi: POI) => {
    setQueue((prev) => {
      if (prev.some(p => p.id === poi.id)) return prev;
      const next = [...prev, poi];
      if (next.length === 1) setCurrentIndex(0);
      return next;
    });
  }, []);

  const skip = useCallback((direction: 'next' | 'prev') => {
    setQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue;
      setCurrentIndex((prevIndex) => {
        const next = direction === 'next' ? prevIndex + 1 : prevIndex - 1;
        if (next >= prevQueue.length) {
          pause();
          return prevIndex;
        }
        return Math.max(0, next);
      });
      return prevQueue;
    });
  }, [pause]);

  const clearQueue = useCallback(() => {
    pause();
    revokeObjectUrl();
    if (audioRef.current) audioRef.current.src = '';
    setQueue([]);
    setCurrentIndex(-1);
  }, [pause]);

  const currentPoi = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  return {
    currentPoi,
    queue,
    currentIndex,
    isPlaying,
    audioRef,
    currentTime,
    duration,
    enqueue,
    skip,
    play,
    pause,
    clearQueue,
  };
}