package de.jan.testsupport;

import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.ExtensionContext;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.List;

/**
 * Starts the Firestore emulator in Datastore mode (the one start-dev uses) for the controller tests,
 * once per test run, and stops it when all tests are done. Needs the gcloud CLI.
 *
 * Host and project come from the environment variables Maven sets for the tests (see the surefire
 * plugin in pom.xml): its own port, so the emulator of start-dev is left alone, and a project id
 * ending with "-test", because the tests wipe the database.
 * If something already listens on that port, it is used as it is and not stopped.
 */
public class DatastoreEmulatorExtension implements BeforeAllCallback {

    private static final String PROJECT_SUFFIX = "-test";
    private static final int START_TIMEOUT_SECONDS = 90;

    @Override
    public void beforeAll(ExtensionContext context) {
        // the root store lives for the whole test run, so the emulator is started once and closed at the end
        context.getRoot().getStore(ExtensionContext.Namespace.GLOBAL)
                .getOrComputeIfAbsent(Emulator.class.getName(), key -> new Emulator());
    }

    private static class Emulator implements ExtensionContext.Store.CloseableResource {

        private Process process;

        Emulator() {
            String hostAndPort = System.getenv("DATASTORE_EMULATOR_HOST");
            if (hostAndPort == null || !hostAndPort.contains(":")) {
                throw new IllegalStateException("DATASTORE_EMULATOR_HOST is not set. Run the tests with \"mvn test\", "
                        + "or set DATASTORE_EMULATOR_HOST and GOOGLE_CLOUD_PROJECT like the surefire plugin in pom.xml does.");
            }
            String project = System.getenv("GOOGLE_CLOUD_PROJECT");
            if (project == null || !project.endsWith(PROJECT_SUFFIX)) {
                throw new IllegalStateException("GOOGLE_CLOUD_PROJECT must end with \"" + PROJECT_SUFFIX
                        + "\" because the tests wipe the database, but is: " + project);
            }

            String host = hostAndPort.substring(0, hostAndPort.lastIndexOf(':'));
            int port = Integer.parseInt(hostAndPort.substring(hostAndPort.lastIndexOf(':') + 1));
            if (isListening(host, port)) {
                return;
            }

            File log = new File("target", "datastore-emulator.log");
            start(hostAndPort, log);
            waitUntilListening(host, port, log);
        }

        private void start(String hostAndPort, File log) {
            String gcloud = "gcloud emulators firestore start --database-mode=datastore-mode --host-port="
                    + hostAndPort + " --quiet";
            boolean windows = System.getProperty("os.name").toLowerCase().contains("win");
            // gcloud is a .cmd file on Windows and a shell script elsewhere
            List<String> command = windows ? List.of("cmd", "/c", gcloud) : List.of("sh", "-c", gcloud);
            try {
                log.getParentFile().mkdirs();
                process = new ProcessBuilder(command).redirectErrorStream(true).redirectOutput(log).start();
            } catch (IOException e) {
                throw new IllegalStateException("Could not start the Datastore emulator. Is the gcloud CLI installed?", e);
            }
            // also stop it if the test run is aborted
            Runtime.getRuntime().addShutdownHook(new Thread(this::close));
        }

        private void waitUntilListening(String host, int port, File log) {
            long deadline = System.currentTimeMillis() + START_TIMEOUT_SECONDS * 1000L;
            while (System.currentTimeMillis() < deadline) {
                if (isListening(host, port)) {
                    return;
                }
                if (!process.isAlive()) {
                    break;
                }
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
            close();
            throw new IllegalStateException("The Datastore emulator did not start, see " + log.getAbsolutePath()
                    + ". Is the gcloud CLI installed?");
        }

        private static boolean isListening(String host, int port) {
            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress(host, port), 500);
                return true;
            } catch (IOException e) {
                return false;
            }
        }

        @Override
        public void close() {
            if (process == null) {
                return;
            }
            // gcloud starts the emulator as a child process (Java), which has to be stopped too
            process.descendants().forEach(ProcessHandle::destroyForcibly);
            process.destroyForcibly();
            process = null;
        }
    }
}
