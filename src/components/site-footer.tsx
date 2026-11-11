type Props = {
  siteName: string;
};

export default function SiteFooter({ siteName }: Props) {
  return (
    <footer className="site-footer">
      <div className="container footer-inner footer-inner-clean">
        <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
