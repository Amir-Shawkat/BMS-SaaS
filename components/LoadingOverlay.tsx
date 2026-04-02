import Image from "next/image";

type LoadingOverlayProps = {
  title?: string;
  subtitle?: string;
};

const LoadingOverlay = ({
  title = "Synthesizing your book",
  subtitle = "Please wait while we prepare your interactive experience.",
}: LoadingOverlayProps) => {
  return (
    <div className="loading-wrapper" role="status" aria-live="polite">
      <div className="loading-shadow-wrapper bg-white">
        <div className="loading-shadow">
          <Image
            src="/assets/loader.png"
            alt="Loading"
            width={48}
            height={48}
            className="loading-animation"
          />
          <div className="text-center space-y-1">
            <p className="loading-title">{title}</p>
            <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
