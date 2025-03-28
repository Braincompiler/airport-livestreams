package util

import (
	"fmt"
	"slices"
	"strings"
)

func GetAsListForInClause(values []string) string {
	x := Map(slices.Values(values), func(s string) string {
		return fmt.Sprintf("'%s'", s)
	})

	return strings.Join(slices.Collect(x), ",")
}
