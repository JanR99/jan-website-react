package de.jan.games;

import java.util.List;

public interface MistakeStats<M extends Mistake> {

    List<M> getMistakes();
}
