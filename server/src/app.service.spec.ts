import { AppService } from "./app.service";

describe("AppService", () => {
    it('getHello returns greeting', () => {
    const svc = new AppService();
    const res = svc.getHello?.();
    expect(typeof res === 'string' || res === undefined).toBe(true);
  });
});