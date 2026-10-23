export function getSelectPosition(anchor, viewport, navbarBottom, contentHeight)
{
  const margin = 8;
  const gap = 4;
  const leftEdge = viewport.left + margin;
  const rightEdge = viewport.left + viewport.width - margin;
  const topEdge = Math.max(viewport.top + margin, navbarBottom + margin);
  const bottomEdge = viewport.top + viewport.height - margin;

  if (rightEdge <= leftEdge || bottomEdge <= topEdge || anchor.bottom <= topEdge || anchor.top >= bottomEdge)
  {
    return null;
  }

  const width = Math.min(anchor.width, rightEdge - leftEdge);
  const below = Math.max(0, bottomEdge - Math.max(topEdge, anchor.bottom + gap));
  const above = Math.max(0, Math.min(bottomEdge, anchor.top - gap) - topEdge);
  const openBelow = below >= Math.min(280, contentHeight) || below >= above;
  const maxHeight = Math.min(280, openBelow ? below : above);
  const height = Math.min(contentHeight, maxHeight);

  return {
    width,
    left: Math.max(leftEdge, Math.min(anchor.left, rightEdge - width)),
    top: openBelow ? Math.max(topEdge, anchor.bottom + gap) : Math.min(bottomEdge, anchor.top - gap) - height,
    maxHeight,
  };
}
