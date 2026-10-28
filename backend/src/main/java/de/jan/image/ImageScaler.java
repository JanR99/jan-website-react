package de.jan.image;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;

/** Scales images down on the server, e.g. for the previews of the travel photos. */
public final class ImageScaler {

    private static final float JPEG_QUALITY = 0.8f;

    private ImageScaler() {

    }

    /**
     * The image as a JPEG whose shorter side is {@code shortSide} pixels, so it still fills a square tile of that size.
     *
     * @return null if the image is not larger than that or can't be read (WebP, which Java can't decode)
     */
    public static byte[] scaleDown(byte[] data, int shortSide) {
        BufferedImage image;
        try {
            image = ImageIO.read(new ByteArrayInputStream(data));
        } catch (IOException | RuntimeException e) {
            // a damaged file: then there is just no smaller version
            return null;
        }
        if (image == null || Math.min(image.getWidth(), image.getHeight()) <= shortSide) {
            return null;
        }
        double factor = (double) shortSide / Math.min(image.getWidth(), image.getHeight());
        int width = Math.max(1, (int) Math.round(image.getWidth() * factor));
        int height = Math.max(1, (int) Math.round(image.getHeight() * factor));

        // halving step by step looks much smoother than one big step
        BufferedImage current = image;
        while (current.getWidth() / 2 >= width && current.getHeight() / 2 >= height) {
            current = scaled(current, current.getWidth() / 2, current.getHeight() / 2);
        }
        return jpeg(scaled(current, width, height));
    }

    /** Also turns a transparent PNG into one on white, since JPEG has no transparency. */
    private static BufferedImage scaled(BufferedImage image, int width, int height) {
        BufferedImage result = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = result.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, width, height);
            graphics.drawImage(image, 0, 0, width, height, null);
        } finally {
            graphics.dispose();
        }
        return result;
    }

    private static byte[] jpeg(BufferedImage image) {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(JPEG_QUALITY);
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ImageOutputStream out = ImageIO.createImageOutputStream(bytes)) {
            writer.setOutput(out);
            writer.write(null, new IIOImage(image, null, null), param);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        } finally {
            writer.dispose();
        }
        return bytes.toByteArray();
    }
}
