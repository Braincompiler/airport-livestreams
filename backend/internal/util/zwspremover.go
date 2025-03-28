package util

import "strings"

const (
	// ZWSP represents zero-width space.
	ZWSP = '\u200B'

	// ZWNBSP represents zero-width no-break space.
	ZWNBSP = '\uFEFF'

	// ZWJ represents zero-width joiner.
	ZWJ = '\u200D'

	// ZWNJ represents zero-width non-joiner.
	ZWNJ = '\u200C'

	empty = ""
)

var replacer = strings.NewReplacer(string(ZWSP), empty,
	string(ZWNBSP), empty,
	string(ZWJ), empty,
	string(ZWNJ), empty)

func RemoveZeroWidthSpace(s string) string {
	return replacer.Replace(s)
}
