/**
 * Represents gyroscope data with x, y, and z axis values.
 */
export interface GyroscopeData {
  /**
   * The rotation along the x-axis.
   */
  x: number;
  /**
   * The rotation along the y-axis.
   */
  y: number;
  /**
   * The rotation along the z-axis.
   */
  z: number;
}

/**
 * Asynchronously retrieves the current gyroscope data.
 *
 * @returns A promise that resolves to a GyroscopeData object containing x, y, and z values.
 */
export async function getGyroscopeData(): Promise<GyroscopeData> {
  // TODO: Implement this by calling an API.

  return {
    x: 0.1,
    y: 0.2,
    z: 0.3,
  };
}
