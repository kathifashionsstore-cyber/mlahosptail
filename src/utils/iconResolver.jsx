import React from "react";
import * as LucideIcons from "lucide-react";

/**
 * Resolves a string icon name to a Lucide React component.
 * Fallback is set to 'Activity' if the icon name is not found.
 */
export function Icon({ name, ...props }) {
  const IconComponent = LucideIcons[name] || LucideIcons.Activity;
  return <IconComponent {...props} />;
}

export default Icon;
