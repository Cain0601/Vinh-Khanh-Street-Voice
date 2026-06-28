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