include n.Makefile

.PHONY: test

test-unit:
	mocha --recursive

test-int:
	mocha int-tests/

test: verify test-unit
