package de.jan.recipe.repository;

import de.jan.recipe.RecipeSeedMarker;
import de.jan.recipe.RecipeSeedMarkerDAO;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class RecipeSeedMarkerRepository {

    private final RecipeSeedMarkerDAO seedMarkerDAO = new RecipeSeedMarkerDAO();

    /** Whether the recipes of resources/recipes/recipes.json have all been imported, see RecipeSeedMarker. */
    public boolean isImported() {
        return seedMarkerDAO.exists(RecipeSeedMarker.ID);
    }

    public void markImported() {
        seedMarkerDAO.save(new RecipeSeedMarker(new Date()));
    }
}
