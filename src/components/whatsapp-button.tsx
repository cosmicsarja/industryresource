import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function WhatsAppButton({
  phone,
  vendorId,
  label = "WhatsApp",
  message = "Hi, I found your workshop on IndustryResource (industryresource.in).",
  className,
  size = "sm",
}: {
  phone?: string | null;
  vendorId?: string;
  label?: string;
  message?: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, "");
  const number = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  const handleClick = async () => {
    if (vendorId) {
      void supabase.from("analytics_events").insert({
        vendor_id: vendorId,
        event_type: "whatsapp_click",
      });
    }
  };

  return (
    <Button
      asChild
      size={size}
      className={cn("bg-success text-success-foreground hover:bg-success/90", className)}
    >
      <a href={url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        <MessageCircle className="mr-1.5 h-4 w-4" /> {label}
      </a>
    </Button>
  );
}
