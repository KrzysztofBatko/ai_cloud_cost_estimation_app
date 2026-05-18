import { Cloud, Globe, Database, Triangle } from "lucide-react";

export const iconMap = {
  aws: <Cloud className="w-5 h-5 text-orange-500" />,
  azure: <Cloud className="w-5 h-5 text-blue-500" />,
  gcp: <Globe className="w-5 h-5 text-blue-400" />,
  oracle: <Database className="w-5 h-5 text-red-500" />,
  vercel: <Triangle className="w-5 h-5 text-black" />,
};
