import { ICell } from "./ICell";
import { SnapShot } from "./Snapshot";

/**
 * Manages the version history of a spreadsheet
 */
export class VersionHistory {
  /**
   * An array of snapshots representing the version history.
   */
  public versions: Array<SnapShot>;

  /**
   * Constructor of `VersionHistory`.
   */
  constructor() {
    this.versions = new Array<SnapShot>();
  }

  /**
   * Fetches all snapshots in the version history.
   *
   * @returns An array of `SnapShot` instances.
   */
  public getSnapshots(): Array<SnapShot> {
    return this.versions;
  }

  /**
   * Adds a new snapshot to the version history.
   *
   * @param name - The name of the snapshot.
   * @param user - The user who created the snapshot.
   * @param datetime - The date and time when the snapshot was created.
   * @param grid - A 2D array representing the snapshot of the spreadsheet.
   */
  public addSnapshot(
    name: string,
    user: string,
    datetime: string,
    grid: Array<Array<ICell>>
  ): void {
    this.versions.push(new SnapShot(name, user, datetime, grid));
  }
}
