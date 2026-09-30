package de.jan.objectify;

import java.util.Collection;

/**
 * One condition for BaseDAO.find / findKeys, so DAOs don't have to build Objectify queries.
 * Several filters passed together are combined with AND. The property must be @Index.
 */
public record Filter(String property, Operator operator, Object value) {

    public enum Operator {
        EQUAL("="),
        NOT_EQUAL("!="),
        LESS_THAN("<"),
        LESS_THAN_OR_EQUAL("<="),
        GREATER_THAN(">"),
        GREATER_THAN_OR_EQUAL(">="),
        IN("in");

        private final String symbol;

        Operator(String symbol) {
            this.symbol = symbol;
        }

        public String symbol() {
            return symbol;
        }
    }

    public static Filter eq(String property, Object value) {
        return new Filter(property, Operator.EQUAL, value);
    }

    public static Filter notEq(String property, Object value) {
        return new Filter(property, Operator.NOT_EQUAL, value);
    }

    public static Filter lt(String property, Object value) {
        return new Filter(property, Operator.LESS_THAN, value);
    }

    public static Filter lte(String property, Object value) {
        return new Filter(property, Operator.LESS_THAN_OR_EQUAL, value);
    }

    public static Filter gt(String property, Object value) {
        return new Filter(property, Operator.GREATER_THAN, value);
    }

    public static Filter gte(String property, Object value) {
        return new Filter(property, Operator.GREATER_THAN_OR_EQUAL, value);
    }

    public static Filter in(String property, Collection<?> values) {
        return new Filter(property, Operator.IN, values);
    }

    /** Condition string in Objectify's format, e.g. "createdAt <" */
    String condition() {
        return property + " " + operator.symbol();
    }
}
