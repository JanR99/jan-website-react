package de.jan.games.repository;

import de.jan.games.Mistake;
import de.jan.games.MistakeStats;
import de.jan.objectify.BaseDAO;
import de.jan.objectify.DatastoreEntity;
import de.jan.user.User;
import de.jan.user.UserDataOwner;

import java.util.List;
import java.util.function.Function;

public abstract class MistakeStatsRepository<S extends DatastoreEntity & MistakeStats<M>, M extends Mistake, D>
        implements UserDataOwner {

    protected final BaseDAO<S, Long> statsDAO;
    private final int maxMistakes;
    private final Function<M, D> toMistakeDTO;

    protected MistakeStatsRepository(BaseDAO<S, Long> statsDAO, int maxMistakes, Function<M, D> toMistakeDTO) {
        this.statsDAO = statsDAO;
        this.maxMistakes = maxMistakes;
        this.toMistakeDTO = toMistakeDTO;
    }

    public List<D> getMistakes(User user) {
        S stats = statsDAO.get(user.getId());
        return stats == null ? List.of() : toDTOs(stats.getMistakes());
    }

    public List<D> deleteMistake(User user, String key) {
        S stats = statsDAO.get(user.getId());
        if (stats == null) {
            return List.of();
        }
        if (MistakeList.remove(stats.getMistakes(), key)) {
            stats = statsDAO.save(stats);
        }
        return toDTOs(stats.getMistakes());
    }

    @Override
    public void deleteDataOf(User user) {
        statsDAO.delete(user.getId());
    }

    protected void updateMistakes(S stats, List<M> asked, List<Boolean> answers) {
        MistakeList.update(stats.getMistakes(), asked, answers, maxMistakes);
    }

    private List<D> toDTOs(List<M> mistakes) {
        return MistakeList.sorted(mistakes).stream().map(toMistakeDTO).toList();
    }
}
