import { Turnstile } from "@marsidev/react-turnstile";

const VerifySecurity = ({
  onTokenReceived,
}: {
  onTokenReceived: (token: string) => void;
}) => {
  return (
    <Turnstile
      siteKey={import.meta.env.VITE_CLOUDFLARE_SITE_KEY}
      onSuccess={(token) => onTokenReceived(token)}
      onExpire={() => onTokenReceived("")}
    />
  );
};

export default VerifySecurity;
