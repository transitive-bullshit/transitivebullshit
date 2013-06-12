# Makefile
# 
#     Contains dependency logic for preprocessing, optimizing, and deploying 
# server assets.
# 
# @author:    Travis Fischer (fisch0920@gmail.com)
# @copyright: (c) 2012 Travis Fischer

override PROJECT_BASE_DIR	= .
override PROJECT_BASE_LIB	= $(PROJECT_BASE_DIR)/.make

# Sanity-check PROJECT_BASE_DIR and PROJECT_BASE_LIB
$(if $(shell [ -d $(PROJECT_BASE_LIB) ] && echo "exists"),,                                     \
   $(shell "Could not find PROJECT_BASE_LIB '$(PROJECT_BASE_LIB)'")                             \
   $(shell "You need to point PROJECT_BASE_DIR to the directory containing the .make library")  \
   $(error "Invalid PROJECT_BASE_LIB"))

include $(PROJECT_BASE_LIB)/defines.mk

LESS_CSS_DIRS               = assets/css assets/css/libs
LESS_CSS_PROG               = lessc
LESS_CSS_SOURCE_SUFFIX      = less
LESS_CSS_TARGET_SUFFIX      = css
LESS_CSS_SOURCES            = $(strip \
    $(foreach DIR,$(LESS_CSS_DIRS),$(wildcard $(DIR)/*.$(LESS_CSS_SOURCE_SUFFIX))))
LESS_CSS_TARGETS            = $(LESS_CSS_SOURCES:%.$(LESS_CSS_SOURCE_SUFFIX)=%.$(LESS_CSS_TARGET_SUFFIX))

ALL_TARGETS					= $(LESS_CSS_TARGETS) 

define ADD_LESS_CSS_TARGET
$1/%.$(LESS_CSS_TARGET_SUFFIX): $1/%.$(LESS_CSS_SOURCE_SUFFIX)
	@$$(CECHO) "$(LESS_CSS_PROG) $$(BOLD_COLOR)$$(FR_COLOR_RED)$$<$$(END_COLOR) > $$(BOLD_COLOR)$$(FR_COLOR_GREEN)$$@$$(END_COLOR)"
	@$(LESS_CSS_PROG) $$< > $$@
	@echo
endef


all: $(ALL_TARGETS)

$(foreach DIR,$(LESS_CSS_DIRS),$(eval $(call ADD_LESS_CSS_TARGET,$(DIR))))

.PHONY: all clean help

clean:
	$(RM) -rf $(GENERATED_BASE_DIR)
	$(RM) -f  $(ALL_TARGETS)
	@echo

help::
	@$(CECHO) "$(FR_COLOR_RED)Usage:$(END_COLOR) make [target1 ...]"
	@echo "   * the default target is 'all'"
	@echo

