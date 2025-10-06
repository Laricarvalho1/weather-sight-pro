import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Share2, Link, Mail, Facebook, Twitter } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  location: string;
}

const ShareButton = ({ location }: ShareButtonProps) => {
  const shareUrl = window.location.href;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const shareEmail = () => {
    const subject = `Climate Analysis - ${location}`;
    const body = `Check out the climate analysis of ${location}: ${shareUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareTwitter = () => {
    const text = `Climate Analysis ${location}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`);
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem onClick={copyLink} className="gap-2 cursor-pointer">
          <Link className="h-4 w-4" />
          Copiar Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareEmail} className="gap-2 cursor-pointer">
          <Mail className="h-4 w-4" />
          Enviar por E-mail
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareTwitter} className="gap-2 cursor-pointer">
          <Twitter className="h-4 w-4" />
          Compartilhar no Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareFacebook} className="gap-2 cursor-pointer">
          <Facebook className="h-4 w-4" />
          Compartilhar no Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
