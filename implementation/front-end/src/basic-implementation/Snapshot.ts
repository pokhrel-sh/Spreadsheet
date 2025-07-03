import { ICell } from "./ICell";

/**
 * Class representing a snapshot of the spreadsheet created by a user
 */
export class SnapShot {
  /**
   * The name of the snapshot.
   */
  private name: string;

  /**
   * The user who created the snapshot.
   */
  private user: string;

  /**
   * The date and time the snapshot was created.
   */
  private datetime: string;

  /**
   * A 2D array representing the spreadsheet at the time of the snapshot.
   */
  private grid: Array<Array<ICell>>;

  /**
   * Creates a new instance of `SnapShot`.
   * @param name - The name of the snapshot.
   * @param user - The user who created the snapshot.
   * @param datetime - The date and time the snapshot was created.
   * @param grid - A 2D array representing the spreadsheet
   */
  constructor(
    name: string,
    user: string,
    datetime: string,
    grid: Array<Array<ICell>>
  ) {
    this.name = name;
    this.user = user;
    this.datetime = datetime;
    this.grid = structuredClone(grid);
  }

  /**
   * Retrieves the name of the snapshot.
   *
   * @returns The name of the snapshot as a string.
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Retrieves the user who created the snapshot.
   *
   * @returns The user who created the snapshot as a string.
   */
  public getUser(): string {
    return this.user;
  }

  /**
   * Retrieves the date and time the snapshot was created.
   *
   * @returns The datetime of the snapshot as a string.
   */
  public getDatetime(): string {
    return this.datetime;
  }

  /**
   * Retrieves the grid state of the snapshot.
   *
   * @returns A 2D array representing the spreadsheet grid.
   */
  public getGrid(): Array<Array<ICell>> {
    return this.grid;
  }
}
