import { useState, useCallback, useRef, useEffect } from 'react';
import type { POI } from '@/components/Map/MapView';

export function usePoiAudioQueue() {
  const [queue, setQueue] = useState<POI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('play', () => setIsPlaying(true));
      audio.removeEventListener('pause', () => setIsPlaying(false));
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    skip('next');
  }, []);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Update audio source when current index changes
  useEffect(() => {
    const currentPoi = queue[currentIndex];
    if (audioRef.current && currentPoi && currentPoi.translation.audioUrl) {
      // Ensure we don't reload the same audio url
      if (audioRef.current.src !== currentPoi.translation.audioUrl) {
        audioRef.current.src = currentPoi.translation.audioUrl;
        audioRef.current.load();
        play(); // Auto-play when switching tracks
      }
    }
  }, [currentIndex, queue, play]);

  const enqueue = useCallback((poi: POI) => {
    setQueue((prevQueue) => {
      // Avoid duplicate POIs in queue
      if (prevQueue.some(p => p.id === poi.id)) {
        return prevQueue;
      }
      
      const newQueue = [...prevQueue, poi];
      
      // If this is the first item, start playing it
      if (newQueue.length === 1) {
        setCurrentIndex(0);
      }
      
      return newQueue;
    });
  }, []);

  const skip = useCallback((direction: 'next' | 'prev') => {
    setQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue;
      
      setCurrentIndex((prevIndex) => {
        let nextIndex = prevIndex;
        if (direction === 'next') {
          nextIndex = prevIndex + 1;
        } else {
          nextIndex = prevIndex - 1;
        }

        // Handle bounds (stop if at end, stay at 0 if at start)
        if (nextIndex >= prevQueue.length) {
          // End of queue
          pause();
          return prevIndex; // Keep the last index to show UI, but not playing
        }
        
        if (nextIndex < 0) {
          nextIndex = 0;
        }
        
        return nextIndex;
      });
      return prevQueue;
    });
  }, [pause]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
    pause();
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  }, [pause]);

  const currentPoi = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  return {
    currentPoi,
    queue,
    currentIndex,
    isPlaying,
    audioRef,
    enqueue,
    skip,
    play,
    pause,
    clearQueue,
  };
}
