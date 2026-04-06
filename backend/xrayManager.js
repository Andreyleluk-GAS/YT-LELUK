import fs from 'fs/promises';
import { spawn } from 'child_process';

let xrayProcess = null;

const MY_VLESS_URI = 'ВСТАВЬ_СЮДА_СВОЮ_VLESS_ССЫЛКУ';

/**
 * Parses a VLESS URI and extracts its components..
 */
function parseVlessUri(uri) {
  try {
    const parsedUrl = new URL(uri);
    if (parsedUrl.protocol !== 'vless:') {
      throw new Error('Протокол должен быть vless://'); // Russian errors since everything is in Russian
    }

    const uuid = parsedUrl.username;
    const address = parsedUrl.hostname;
    const port = parseInt(parsedUrl.port, 10);

    const query = parsedUrl.searchParams;
    const encryption = query.get('encryption') || 'none';
    const security = query.get('security') || 'none';
    const type = query.get('type') || 'tcp';
    const flow = query.get('flow') || '';
    const sni = query.get('sni') || '';
    const fp = query.get('fp') || '';
    const pbk = query.get('pbk') || '';
    const sid = query.get('sid') || '';
    const path = query.get('path') || '/';
    const host = query.get('host') || '';

    return { uuid, address, port, encryption, security, type, flow, sni, fp, pbk, sid, path, host };
  } catch (error) {
    throw new Error('Некорректная VLESS ссылка: ' + error.message);
  }
}

/**
 * Generates an Xray config JSON based on the parsed VLESS details.
 */
function generateXrayConfig(vlessDetails) {
  const { uuid, address, port, encryption, security, type, flow, sni, fp, pbk, sid, path, host } = vlessDetails;

  const outbound = {
    protocol: 'vless',
    settings: {
      vnext: [
        {
          address,
          port,
          users: [
            {
              id: uuid,
              encryption,
              flow
            }
          ]
        }
      ]
    },
    streamSettings: {
      network: type,
      security,
    }
  };

  if (type === 'ws') {
    outbound.streamSettings.wsSettings = {
      path,
      headers: host ? { Host: host } : {}
    };
  } else if (type === 'grpc') {
    outbound.streamSettings.grpcSettings = {
      serviceName: path || ""
    };
  }

  // Security settings
  if (security === 'tls') {
    outbound.streamSettings.tlsSettings = {
      serverName: sni || address,
      fingerprint: fp || 'chrome'
    };
  } else if (security === 'reality') {
    outbound.streamSettings.realitySettings = {
      serverName: sni || address,
      fingerprint: fp || 'chrome',
      publicKey: pbk,
      shortId: sid,
      spiderX: ""
    };
  }

  return {
    log: {
      loglevel: "warning"
    },
    inbounds: [
      {
        port: 10808,
        listen: "127.0.0.1",
        protocol: "socks",
        settings: {
          auth: "noauth",
          udp: true
        }
      },
      {
        port: 10809,
        listen: "127.0.0.1",
        protocol: "http",
        settings: {}
      }
    ],
    outbounds: [
      outbound,
      {
        protocol: "freedom",
        tag: "direct"
      }
    ]
  };
}

/**
 * Stops any existing Xray process and starts a new one with the hardcoded VLESS URI.
 */
export async function startXray() {
  if (xrayProcess) {
    console.log('Остановка предыдущего процесса Xray...');
    xrayProcess.kill();
    xrayProcess = null;
  }

  const details = parseVlessUri(MY_VLESS_URI);
  const config = generateXrayConfig(details);

  const configPath = './xray-config.json';
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));

  return new Promise((resolve, reject) => {
    // В Docker бинарник Xray будет установлен в /usr/local/bin/xray
    // Но для локальной отладки мы используем просто 'xray' (или нужно указать полный путь)
    const executable = process.env.XRAY_PATH || 'xray';

    xrayProcess = spawn(executable, ['-c', configPath]);

    xrayProcess.on('error', (err) => {
      console.error('Ошибка при запуске Xray-core:', err);
      reject(err);
    });

    xrayProcess.stderr.on('data', (data) => {
      console.error(`Xray stderr: ${data}`);
    });

    xrayProcess.stdout.on('data', (data) => {
      // Можно логировать stdout, если нужно
      // console.log(`Xray stdout: ${data}`);
    });

    // Ожидаем короткое время, чтобы убедиться, что процесс не упал сразу
    setTimeout(() => {
      if (xrayProcess && xrayProcess.exitCode === null) {
        resolve({
          socks: 'socks5://127.0.0.1:10808',
          http: 'http://127.0.0.1:10809'
        });
      } else {
        reject(new Error('Процесс Xray завершился слишком быстро или не смог запсутиться.'));
      }
    }, 1000);
  });
}
