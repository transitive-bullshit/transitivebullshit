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

ASSET_VERSION_NUMBER        = 0.0.1
GENERATED_LINE_LENGTH		= 512

GET_JS_DEPENDENCIES			= $(foreach FILE,$(shell grep '^ *script: *' $1 | sed 's/ *script: *\([\w.\/-]*\) */\1/g' | tr '\n' ' '),$(JS_BASE_DIR)/$(FILE))
GET_CSS_DEPENDENCIES		= $(foreach FILE,$(shell grep '^ *stylesheet: *' $1 | sed 's/ *stylesheet: *\([\w.\/-]*\) */\1/g' | tr '\n' ' '),$(CSS_BASE_DIR)/$(FILE))
GET_TEMPLATE_DEPENDENCIES	= $(foreach FILE,$(shell grep '^ *template: *' $1 | sed 's/ *template: *\([\w.\/-]*\) */\1/g' | tr '\n' ' '),$(TEMPLATE_BASE_DIR)/$(FILE))

JS_TARGETS					= $(foreach PAGE,$(HTML_PAGES),$(GENERATED_JS_BASE_DIR)/$(PAGE)$(GENERATED_ASSET_SUFFIX).js)
CSS_TARGETS					= $(foreach PAGE,$(HTML_PAGES),$(GENERATED_CSS_BASE_DIR)/$(PAGE)$(GENERATED_ASSET_SUFFIX).css)
TEMPLATE_TARGETS			= $(foreach PAGE,$(HTML_PAGES),$(TEMPLATE_BASE_DIR)/$(PAGE).generated.html)

TEMPLATES 					= $(strip \
	$(foreach DIR,$(TEMPLATE_DIRS),$(wildcard $(DIR)/*.$(TEMPLATE_SUFFIX))))

DEPENDENCIES				= $(TEMPLATES) $(TEMPLATE_PROG) $(wildcard core/templatetags/*.py)
ALL_TARGETS					= $(LESS_CSS_TARGETS) $(JS_TARGETS) $(TEMPLATE_TARGETS) css_targets $(CSS_TARGETS)

define ADD_LESS_CSS_TARGET
$1/%.$(LESS_CSS_TARGET_SUFFIX): $1/%.$(LESS_CSS_SOURCE_SUFFIX)
	@$$(CECHO) "$(LESS_CSS_PROG) $$(BOLD_COLOR)$$(FR_COLOR_RED)$$<$$(END_COLOR) > $$(BOLD_COLOR)$$(FR_COLOR_GREEN)$$@$$(END_COLOR)"
	@$(LESS_CSS_PROG) $$< > $$@
	@echo
endef

define ADD_JS_TARGET
$(GENERATED_JS_BASE_DIR)/$1$(GENERATED_ASSET_SUFFIX).js: $(HTML_BASE_DIR)/$1.$(HTML_SUFFIX) $(call GET_JS_DEPENDENCIES,$(HTML_BASE_DIR)/$1.$(HTML_SUFFIX))
	@mkdir -p $(GENERATED_JS_BASE_DIR)
	@$$(CECHO) "cat $$(BOLD_COLOR)$$(FR_COLOR_RED)$$(if $$(call ISNULL,$$(strip $$(call REST,$$^))),/dev/null,$$(call REST,$$^))$$(END_COLOR) | java -jar bin/compressor.jar --type js --nomunge --line-break $(GENERATED_LINE_LENGTH) > '$$(BOLD_COLOR)$$(FR_COLOR_GREEN)$$@$$(END_COLOR)'"
	@cat $$(if $$(call ISNULL,$$(strip $$(call REST,$$^))),/dev/null,$$(call REST,$$^)) | java -jar bin/compressor.jar --type js --nomunge --line-break $(GENERATED_LINE_LENGTH) > $$@
	@echo
endef

define ADD_CSS_TARGET
$(GENERATED_CSS_BASE_DIR)/$1$(GENERATED_ASSET_SUFFIX).css: $(HTML_BASE_DIR)/$1.$(HTML_SUFFIX) css_targets $(call GET_CSS_DEPENDENCIES,$(HTML_BASE_DIR)/$1.$(HTML_SUFFIX))
	@mkdir -p $(GENERATED_CSS_BASE_DIR)
	cat $$(if $$(call ISNULL,$$(strip $$(call REST,$$(call REST,$$^)))),/dev/null,$$(call REST,$$(call REST,$$^))) | java -jar bin/compressor.jar --type css --line-break $(GENERATED_LINE_LENGTH) > $$@
	@echo
endef

define ADD_TEMPLATE_TARGET
$(TEMPLATE_BASE_DIR)/$1.generated.html: $(HTML_BASE_DIR)/$1.$(HTML_SUFFIX) $(call GET_TEMPLATE_DEPENDENCIES,$(HTML_BASE_DIR)/$1.$(HTML_SUFFIX))
	@$$(CECHO) "$(TEMPLATE_PROG) $$(foreach FILE,$$(call REST,$$^),-t $$(BOLD_COLOR)$$(FR_COLOR_RED)$$(notdir $$(FILE))$$(END_COLOR)) -o $$(BOLD_COLOR)$$(FR_COLOR_GREEN)$$@$$(END_COLOR)"
	@$(TEMPLATE_PROG) $$(foreach FILE,$$(call REST,$$^),-t $$(notdir $$(FILE))) -o $$@
	@echo
endef

all: $(ALL_TARGETS)

.PHONY: all clean help update update_version deploy css_targets

$(foreach DIR,$(LESS_CSS_DIRS),$(eval $(call ADD_LESS_CSS_TARGET,$(DIR))))
$(foreach PAGE,$(HTML_PAGES),  $(eval $(call ADD_JS_TARGET,$(PAGE))))
$(foreach PAGE,$(HTML_PAGES),  $(eval $(call ADD_TEMPLATE_TARGET,$(PAGE))))
$(foreach PAGE,$(HTML_PAGES),  $(eval $(call ADD_CSS_TARGET,$(PAGE))))

css_targets: $(LESS_CSS_TARGETS);

deploy: $(ALL_TARGETS)
	mkdir -p $(GENERATED_CSS_BASE_DIR)/ie/$(ASSET_VERSION_NUMBER)
	mkdir -p $(GENERATED_PDE_BASE_DIR)/$(ASSET_VERSION_NUMBER)
	cp -rf assets/pde/* $(GENERATED_PDE_BASE_DIR)/$(ASSET_VERSION_NUMBER)
	cp -rf assets/css/ie/* $(GENERATED_CSS_BASE_DIR)/ie/$(ASSET_VERSION_NUMBER)
	cp -rf assets/css/mobile $(GENERATED_CSS_BASE_DIR)/
	cd bin && python deploy_assets.py

update_version:
	@echo $(ASSET_VERSION_NUMBER)
	cd bin && python deploy_version.py

update:
	@echo $(ASSET_VERSION_NUMBER)
	cd bin && python deploy_version.py

version:
	@echo $(ASSET_VERSION_NUMBER)

clean:
	$(RM) -rf $(GENERATED_BASE_DIR)
	$(RM) -f  $(ALL_TARGETS)
	@echo

help::
	@$(CECHO) "$(FR_COLOR_RED)Usage:$(END_COLOR) make [target1 ...]"
	@echo "   * the default target is 'all'"
	@echo

