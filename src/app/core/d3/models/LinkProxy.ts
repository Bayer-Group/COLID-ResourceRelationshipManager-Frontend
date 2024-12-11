import { Link } from './link';
import { Node } from './node';

/**
 * Represents a Link with only the necessary information to compare it to another link.
 *
 * A simplified Link Proxy is always OUTBOUND,
 * meaning that if the original link is inbound, the source and target are reversed
 * to make comparing links easier.
 *
 * A Link Proxy contains its original link in a separate property.
 *
 * @use isSameByValue() to compare to another Link Proxy by source, target, and link type
 *                      (ignoring other properties)
 *
 * @use toOriginalLink() to get the original link back
 */
export class LinkProxy {
  outboundSourceId: string;
  outboundTargetId: string;
  linkTypeKey: string;
  linkTypeValue: string;

  originalLink: Link;

  constructor(originalLink: Link) {
    this.outboundSourceId = originalLink.outbound
      ? this.getPid(originalLink.source)
      : this.getPid(originalLink.target);

    this.outboundTargetId = originalLink.outbound
      ? this.getPid(originalLink.target)
      : this.getPid(originalLink.source);

    this.linkTypeKey = originalLink.linkType.key;

    // Necessary for version links: they have same link type key,
    // but version number is different
    this.linkTypeValue = originalLink.linkType.value;

    this.originalLink = originalLink;
  }

  /**
   * Compares two Link Proxies by source, target, and link type.
   * Ignores all other properties or values.
   *
   * @param anotherLink to compare to
   * @returns true if source, target, and link type are the same, false otherwise
   */
  isSameByValue(anotherLink: LinkProxy): boolean {
    return (
      this.outboundSourceId === anotherLink.outboundSourceId &&
      this.outboundTargetId === anotherLink.outboundTargetId &&
      this.linkTypeKey === anotherLink.linkTypeKey &&
      this.linkTypeValue === anotherLink.linkTypeValue
    );
  }

  /**
   * Nodes can have sources and targets in a form of a Node object or as a direct PID link string.
   * This method always returns the PID link, so it doesn't matter if source/target
   * is a Node or the PID string itself.
   *
   * @param target a link's target, which can be a Node or a PID as a string
   * @returns true if target is a Node, false if it is a string
   */
  getPid(target: Node | string): string {
    return this.isNode(target) ? target.id : target;
  }

  private isNode(target: Node | string): target is Node {
    return (target as Node)?.id !== undefined;
  }
}
