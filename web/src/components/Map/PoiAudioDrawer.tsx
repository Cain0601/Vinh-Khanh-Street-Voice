import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, X, ChevronDown, ListMusic, MapPin } from 'lucide-react';
import type { POI } from '@/components/Map/MapView';
import { useTranslation } from '@/i18n';

interface PoiAudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoi: POI | null;
  queuePois: POI[];
  currentIndex: number;
  isPlaying: boolean;
  onSkip: (direction: 'next' | 'prev') => void;
  onPlay: () => void;
  onPause: () => void;
  audioRef?: React.RefObject<HTMLAudioElement>;
  currentTime?: number;
  duration?: number | undefined;
}

export default function PoiAudioDrawer({
  isOpen,
  onClose,
  currentPoi,
  queuePois,
  currentIndex,
  isPlaying,
  onSkip,
  onPlay,
  onPause,
  audioRef,
  currentTime,
  duration
}: PoiAudioDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);

  const t = useTranslation();

  // Compute progress from currentTime/duration props when available
  useEffect(() => {
    const audio = audioRef?.current;

    const t = audio?.currentTime ?? currentTime ?? 0;
    const d = audio?.duration ?? duration ?? 0;

    if (d > 0) {
      setProgress((t / d) * 100);
    } else {
      setProgress(0);
    }
  }, [currentTime, duration, currentPoi, audioRef]);

  function formatTime(sec?: number) {
    if (!sec || !isFinite(sec)) return '0:00';
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef?.current;

    if (!audio) return;

    const value = parseFloat(e.target.value);

    const d = audio.duration || duration || 0;

    if (!d || !isFinite(d)) return;

    const seekTime = (value / 100) * d;

    audio.currentTime = seekTime;

    setProgress(value);
  };

  if (!isOpen || !currentPoi) return null;

  const hasNext = currentIndex < queuePois.length - 1;
  const hasPrev = currentIndex > 0;
  // Render Compact Mini-player Mode
  if (!isExpanded) {
    return (
      <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100">
        <div 
          className="flex items-center p-3 cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          {/* Thumbnail */}
          <div className="w-12 h-12 rounded bg-slate-700 shrink-0 overflow-hidden">
            {/* Show title as placeholder, no image available */}
            {currentPoi.mediaUrl ? (
              <img src={currentPoi.mediaUrl} alt={currentPoi.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <MapPin size={24} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="ml-3 flex-1 overflow-hidden">
            <h4 className="text-white text-sm font-bold truncate">{currentPoi.title}</h4>
            <p className="text-slate-400 text-xs truncate">
              {queuePois.length > 1 ? `${t.poiDrawer.playing} ${currentIndex + 1}/${queuePois.length}` : t.poiDrawer.playingAudio}
            </p>
            <p className="text-slate-400 text-xs truncate">{formatTime(currentTime)} / {formatTime(duration)}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 pr-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => isPlaying ? onPause() : onPlay()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <button
              onClick={() => onClose()}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="h-1 bg-slate-700 w-full">
          <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  // Render Expanded Full-screen Mode
  return (
    <div className="absolute rounded-xl inset-1 z-20 bg-slate-900 flex flex-col transition-all duration-300 transform translate-y-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-6">
        <button 
          onClick={() => setIsExpanded(false)}
          className="p-2 text-slate-400 hover:text-white"
        >
          <ChevronDown size={28} />
        </button>
        <span className="text-xs font-medium text-slate-400 tracking-widest uppercase">
          Điểm đến hiện tại
        </span>
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Cover Image */}
        <div className="w-full aspect-square bg-slate-800 rounded-2xl shadow-2xl overflow-hidden mb-8 mt-4">
          {currentPoi.mediaUrl ? (
            <img src={currentPoi.mediaUrl} alt={currentPoi.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
              <MapPin size={64} className="mb-4" />
               <p>{t.poiDrawer.noImage}</p>
            </div>
          )}
        </div>

        {/* Title & Queue indicator */}
        <div className="flex justify-between items-end mb-6">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-white mb-1 line-clamp-2">{currentPoi.title}</h2>
            <p className="text-slate-400 text-sm line-clamp-1">
              {currentPoi.summary || 'Khám phá địa điểm này'}
            </p>
          </div>
          {queuePois.length > 1 && (
            <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-md shrink-0">
              <ListMusic size={14} />
              <span>{currentIndex + 1}/{queuePois.length}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1.5 bg-slate-700 rounded-full w-full relative">
            {/* <div 
              className="absolute top-0 left-0 h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
            /> */}
            <input
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={handleSeek}
                  className="absolute top-0 left-0 h-full bg-white rounded-full w-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #00bc7d ${progress}%, #3f3f46 ${progress}%)`,
                    accentColor: '#f97316',
                  }}
                />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8 mb-10">
          <button 
            onClick={() => onSkip('prev')}
            disabled={!hasPrev}
            className={`p-3 rounded-full transition-colors ${hasPrev ? 'text-white hover:bg-slate-800' : 'text-slate-600'}`}
          >
            <SkipBack size={32} fill="currentColor" />
          </button>

          <button 
            onClick={() => isPlaying ? onPause() : onPlay()}
            className="w-20 h-20 flex items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
          >
            {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-2" />}
          </button>

          <button 
            onClick={() => onSkip('next')}
            disabled={!hasNext}
            className={`p-3 rounded-full transition-colors ${hasNext ? 'text-white hover:bg-slate-800' : 'text-slate-600'}`}
          >
            <SkipForward size={32} fill="currentColor" />
          </button>
        </div>

        {/* Additional Info */}
        <div className="bg-slate-800/50 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2">{t.poiDrawer.info}</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              {currentPoi.summary}
            </p>
          {currentPoi.address && (
            <div className="flex items-start gap-2 text-sm mb-2">
              <span className="text-slate-500 shrink-0">Địa chỉ:</span>
              <span className="text-white">{currentPoi.address}</span>
            </div>
          )}
          {currentPoi.contact?.phoneNumber && (
            <div className="flex items-start gap-2 text-sm mb-2">
              <span className="text-slate-500 shrink-0">Liên hệ:</span>
              <a href={`tel:${currentPoi.contact.phoneNumber}`} className="text-white underline">{currentPoi.contact.phoneNumber}</a>
            </div>
          )}
          {(currentPoi.rating || currentPoi.reviewCount) && (
            <div className="flex items-center gap-2 text-sm">
              {typeof currentPoi.rating === 'number' && (
                <span className="text-white font-medium">⭐ {currentPoi.rating.toFixed(1)}</span>
              )}
              {typeof currentPoi.reviewCount !== 'undefined' && (
                <span className="text-slate-400">({currentPoi.reviewCount} đánh giá)</span>
              )}
            </div>
          )}
          {currentPoi.distance !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Khoảng cách:</span>
              <span className="text-white font-medium">{currentPoi.distance.toFixed(0)}m</span>
            </div>
          )}
        </div>
        
        {/* Next in Queue Preview */}
        {hasNext && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => onSkip('next')}>
            <div className="w-10 h-10 rounded bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
              <MapPin size={16} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Tiếp theo</p>
              <p className="text-sm text-slate-200 truncate">{queuePois[currentIndex + 1].title}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
