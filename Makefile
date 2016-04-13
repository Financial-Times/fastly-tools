include n.Makefile

.PHONY: test

test-unit:
	mocha --recursive --require loadvars.js

test: verify test-unit

verify: _verify_eslint _verify_scss_lint
	@echo $(DONE)
