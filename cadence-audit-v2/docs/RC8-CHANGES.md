# V2 rc.8 changes

## Redirected internal-link context

The Internal link targets module now keeps enough source context to make redirect findings easy to explain during training and prospect reviews.

For each checked internal link with a redirect, the UI can show:
- the redirecting URL/path;
- the final destination;
- detected anchor text (with aria-label/title/image-alt fallback when visible text is empty);
- the source page where the link was found;
- a simple placement label such as Footer, Header navigation, Navigation, Main content, Sidebar, or Body / template;
- an **Open source page** action so the reviewer lands on the page that needs editing rather than the redirect destination.

The same source context is retained on broken or access-limited internal-link observations when available.

## Scope

This does not turn the bounded internal-link check into a full-site crawl. It adds better evidence to links the scanner already selected and checked. Placement is inferred from standard semantic HTML containers, so non-semantic or heavily scripted templates can fall back to Body / template or Unknown.
