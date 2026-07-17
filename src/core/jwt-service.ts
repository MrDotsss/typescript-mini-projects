import { AuthData } from "../modes/authentication.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { saveManager, SaveState } from "./save_manager.js";

interface AccessPayload extends JwtPayload {
  id: string;
  username: string;
}

interface RefreshPayload extends JwtPayload {
  id: string;
}

class JwtService {
  private readonly JWT_SECRET = "super-secret-jwt-secret";
  readonly sessionPath: string = "session";

  createRefreshToken(user: AuthData) {
    return jwt.sign(
      {
        id: user.id,
      },
      this.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
  }
  verifyRefresh(token: string): RefreshPayload {
    return jwt.verify(token, this.JWT_SECRET) as RefreshPayload;
  }

  async saveSession(refreshToken: string): Promise<void> {
    const session: SaveState = {
      mode_name: "JWT",
      timestamp: Date.now(),
      data: {
        refreshToken: refreshToken,
      },
    };

    await saveManager.saveData("JWT", session);
  }

  async loadSession(): Promise<string | null> {
    const exist = await saveManager.isSaveExists("JWT");

    if (!exist) {
      return null;
    }

    const session = await saveManager.loadData("JWT");

    if (session) {
      return session.data.refreshToken;
    }

    return null;
  }

  async clearSession(): Promise<void> {
    await saveManager.clearData("JWT");
  }
}

const jwtService = new JwtService();

export { jwtService, AccessPayload, RefreshPayload };
