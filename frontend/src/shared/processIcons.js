import {
  Camera, CheckCircle, Clapperboard, ClipboardList, Film, Lightbulb, Megaphone, Mic, Music,
  Package, Palette, Pencil, Rocket, Scissors, Sparkles, Star, Users,
} from 'lucide-react';

// Names must match PROCESS_ICONS in backend/api/admin/process.php
export const processIcons = {
  Lightbulb, ClipboardList, Users, Clapperboard, Package, Camera, Film, Pencil,
  Scissors, Music, Megaphone, Star, Sparkles, Rocket, CheckCircle, Palette, Mic,
};

export const iconFor = (name) => processIcons[name] || Star;
