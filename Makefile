include n.Makefile

.PHONY: test

test-unit:
	mocha --recursive --require loadvars.js

test: verify test-unit

